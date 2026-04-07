package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
)

// GetAccount handles GET /v1/account.
func (h *Handler) GetAccount(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	user, err := h.Store.GetUserByID(r.Context(), userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	mfaEnabled, _ := h.Store.IsMFAEnabled(r.Context(), userID)
	hasRecovery, _ := h.Store.HasRecoveryKey(r.Context(), userID)

	h.JSON(w, http.StatusOK, model.AccountResponse{
		User:           *user,
		MFAEnabled:     mfaEnabled,
		HasRecoveryKey: hasRecovery,
	})
}

// UpdateAccount handles PUT /v1/account.
func (h *Handler) UpdateAccount(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.UpdateAccountRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email != "" {
		// Check uniqueness
		existing, err := h.Store.GetUserByEmail(r.Context(), req.Email)
		if err == nil && existing.ID != userID {
			h.Error(w, http.StatusConflict, "email already in use")
			return
		}
		if err := h.Store.UpdateUserEmail(r.Context(), userID, req.Email); err != nil {
			h.Log.Error().Err(err).Msg("failed to update email")
			h.Error(w, http.StatusInternalServerError, "internal error")
			return
		}
	}

	if req.DisplayName != "" {
		if err := h.Store.UpdateUserDisplayName(r.Context(), userID, req.DisplayName); err != nil {
			h.Log.Error().Err(err).Msg("failed to update display name")
			h.Error(w, http.StatusInternalServerError, "internal error")
			return
		}
	}

	// Return updated user
	user, err := h.Store.GetUserByID(r.Context(), userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	mfaEnabled, _ := h.Store.IsMFAEnabled(r.Context(), userID)

	h.JSON(w, http.StatusOK, map[string]any{
		"id":          user.ID,
		"email":       user.Email,
		"displayName": user.DisplayName,
		"mfaEnabled":  mfaEnabled,
		"createdAt":   user.CreatedAt,
	})
}

// DeleteAccount handles DELETE /v1/account.
func (h *Handler) DeleteAccount(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Cascade delete via FK constraints handles sessions, keys, MFA, recovery
	if err := h.Store.DeleteUser(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to delete account")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// ChangePassword handles PUT /v1/account/password.
func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.ChangePasswordRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.NewSRPSalt == "" || req.NewSRPVerifier == "" {
		h.Error(w, http.StatusBadRequest, "newSrpSalt and newSrpVerifier are required")
		return
	}

	if err := h.Store.UpdateUserSRP(r.Context(), userID, req.NewSRPSalt, req.NewSRPVerifier); err != nil {
		h.Log.Error().Err(err).Msg("failed to update password")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Invalidate all other sessions
	if err := h.Store.DeleteUserSessions(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to clear sessions after password change")
	}

	// Create a new session for the current user
	token, err := h.Store.CreateSession(r.Context(), userID, r.UserAgent(), r.RemoteAddr)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to create new session")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, map[string]string{
		"sessionToken": token,
	})
}

// GenerateRecoveryKey handles POST /v1/account/recovery-key.
func (h *Handler) GenerateRecoveryKey(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	raw, keyHash, err := store.GenerateRecoveryKey()
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to generate recovery key")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	if err := h.Store.StoreRecoveryKey(r.Context(), userID, []byte(raw), keyHash); err != nil {
		h.Log.Error().Err(err).Msg("failed to store recovery key")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.RecoveryKeyResponse{
		RecoveryKey: raw,
	})
}

// UploadKeys handles POST /v1/keys/upload.
func (h *Handler) UploadKeys(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.RegisterRequest // reuse for key fields
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.PublicKey) == 0 || len(req.SigningKey) == 0 {
		h.Error(w, http.StatusBadRequest, "publicKey and signingKey are required")
		return
	}

	// Revoke old active keys
	if err := h.Store.RevokePublicKeys(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to revoke old keys")
	}

	sig := req.Signature
	if sig == nil {
		sig = []byte{}
	}
	bundle, err := h.Store.StorePublicKeys(r.Context(), userID, req.PublicKey, req.SigningKey, sig)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to store public keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, bundle)
}

// GetKeys handles GET /v1/keys/{userID}.
func (h *Handler) GetKeys(w http.ResponseWriter, r *http.Request) {
	targetUserID := chi.URLParam(r, "userID")
	if targetUserID == "" {
		h.Error(w, http.StatusBadRequest, "userID is required")
		return
	}

	bundle, err := h.Store.GetActivePublicKeys(r.Context(), targetUserID)
	if err == store.ErrNotFound {
		h.Error(w, http.StatusNotFound, "no keys found for user")
		return
	}
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to get public keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, bundle)
}
