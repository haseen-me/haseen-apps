package handler

import (
	"net/http"
	"sync"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/haseen-me/haseen-apps/services/auth/internal/srp"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
)

// srpSessions holds in-progress SRP login sessions (email → ServerSession).
// In production this would use Redis; here we use an in-memory map with expiry.
type srpSessionEntry struct {
	session   *srp.ServerSession
	userID    string
	expiresAt time.Time
}

var (
	srpSessions   = make(map[string]*srpSessionEntry)
	srpSessionsMu sync.Mutex
)

func cleanupSRPSession(email string) {
	srpSessionsMu.Lock()
	delete(srpSessions, email)
	srpSessionsMu.Unlock()
}

// Register handles POST /v1/register.
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req model.RegisterRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.SRPSalt == "" || req.SRPVerifier == "" {
		h.Error(w, http.StatusBadRequest, "email, srpSalt, and srpVerifier are required")
		return
	}
	if len(req.PublicKey) == 0 || len(req.SigningKey) == 0 {
		h.Error(w, http.StatusBadRequest, "publicKey and signingKey are required")
		return
	}

	// Check if email already exists
	_, err := h.Store.GetUserByEmail(r.Context(), req.Email)
	if err == nil {
		h.Error(w, http.StatusConflict, "email already registered")
		return
	}
	if err != store.ErrNotFound {
		h.Log.Error().Err(err).Msg("db error checking email")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Create user
	user, err := h.Store.CreateUser(r.Context(), req.Email, req.SRPSalt, req.SRPVerifier)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to create user")
		h.Error(w, http.StatusInternalServerError, "failed to create account")
		return
	}

	// Store public keys
	sig := req.Signature
	if sig == nil {
		sig = []byte{}
	}
	_, err = h.Store.StorePublicKeys(r.Context(), user.ID, req.PublicKey, req.SigningKey, sig)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to store public keys")
		h.Error(w, http.StatusInternalServerError, "failed to store keys")
		return
	}

	// Generate recovery key
	recoveryRaw, recoveryHash, err := store.GenerateRecoveryKey()
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to generate recovery key")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	// Store recovery key (encrypted_key placeholder — client should re-encrypt with user key)
	if err := h.Store.StoreRecoveryKey(r.Context(), user.ID, []byte(recoveryRaw), recoveryHash); err != nil {
		h.Log.Error().Err(err).Msg("failed to store recovery key")
	}

	// Create session
	token, err := h.Store.CreateSession(r.Context(), user.ID, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to create session")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusCreated, model.RegisterResponse{
		UserID:       user.ID,
		SessionToken: token,
		RecoveryKey:  recoveryRaw,
	})
}

// LoginInit handles POST /v1/login/init — first step of SRP login.
func (h *Handler) LoginInit(w http.ResponseWriter, r *http.Request) {
	var req model.LoginInitRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.SRPA == "" {
		h.Error(w, http.StatusBadRequest, "email and srpA are required")
		return
	}

	user, err := h.Store.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		// Don't reveal whether email exists — return fake salt+B
		h.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	sess, bHex, err := srp.NewServerSession(user.SRPVerifier)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to create SRP session")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	if err := sess.SetClientPublic(req.SRPA); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid srpA value")
		return
	}

	// Store SRP session for 5 minutes
	srpSessionsMu.Lock()
	srpSessions[req.Email] = &srpSessionEntry{
		session:   sess,
		userID:    user.ID,
		expiresAt: time.Now().Add(5 * time.Minute),
	}
	srpSessionsMu.Unlock()

	h.JSON(w, http.StatusOK, model.LoginInitResponse{
		SRPB:    bHex,
		SRPSalt: user.SRPSalt,
	})
}

// LoginVerify handles POST /v1/login/verify — second step of SRP login.
func (h *Handler) LoginVerify(w http.ResponseWriter, r *http.Request) {
	var req model.LoginVerifyRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.SRPM1 == "" {
		h.Error(w, http.StatusBadRequest, "email and srpM1 are required")
		return
	}

	srpSessionsMu.Lock()
	entry, ok := srpSessions[req.Email]
	srpSessionsMu.Unlock()

	if !ok || time.Now().After(entry.expiresAt) {
		cleanupSRPSession(req.Email)
		h.Error(w, http.StatusUnauthorized, "login session expired, start again")
		return
	}

	m2Hex, valid := entry.session.VerifyProof(req.SRPM1)
	cleanupSRPSession(req.Email)

	if !valid {
		h.Error(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	// Check if MFA is enabled
	mfaEnabled, err := h.Store.IsMFAEnabled(r.Context(), entry.userID)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to check MFA status")
	}

	if mfaEnabled {
		// Store a temporary pending-MFA SRP session
		srpSessionsMu.Lock()
		srpSessions["mfa:"+req.Email] = &srpSessionEntry{
			session:   entry.session,
			userID:    entry.userID,
			expiresAt: time.Now().Add(5 * time.Minute),
		}
		srpSessionsMu.Unlock()

		h.JSON(w, http.StatusOK, model.LoginVerifyResponse{
			SRPM2:       m2Hex,
			MFARequired: true,
		})
		return
	}

	// Create session
	user, err := h.Store.GetUserByID(r.Context(), entry.userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	token, err := h.Store.CreateSession(r.Context(), entry.userID, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to create session")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.LoginVerifyResponse{
		SessionToken: token,
		SRPM2:        m2Hex,
		User:         *user,
	})
}

// Logout handles POST /v1/logout.
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	token := h.Token(r)
	if token == "" {
		h.Error(w, http.StatusUnauthorized, "missing token")
		return
	}
	if err := h.Store.DeleteSession(r.Context(), token); err != nil {
		h.Log.Error().Err(err).Msg("failed to delete session")
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// SessionRefresh handles POST /v1/session/refresh.
func (h *Handler) SessionRefresh(w http.ResponseWriter, r *http.Request) {
	token := h.Token(r)
	if token == "" {
		h.Error(w, http.StatusUnauthorized, "missing token")
		return
	}
	if err := h.Store.RefreshSession(r.Context(), token); err != nil {
		h.Error(w, http.StatusUnauthorized, "invalid or expired session")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// SessionDelete handles DELETE /v1/session — deletes all user sessions.
func (h *Handler) SessionDelete(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if err := h.Store.DeleteUserSessions(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to delete sessions")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}
