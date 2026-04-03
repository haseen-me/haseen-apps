package handler

import (
	"net/http"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/haseen-me/haseen-apps/services/auth/internal/totp"
)

// MFAVerifyLogin handles POST /v1/mfa/verify-login — MFA step after SRP login.
func (h *Handler) MFAVerifyLogin(w http.ResponseWriter, r *http.Request) {
	var req model.MFAVerifyRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Email == "" || req.Code == "" {
		h.Error(w, http.StatusBadRequest, "email and code are required")
		return
	}

	// Look up the pending MFA SRP session
	srpSessionsMu.Lock()
	entry, ok := srpSessions["mfa:"+req.Email]
	srpSessionsMu.Unlock()

	if !ok || time.Now().After(entry.expiresAt) {
		cleanupSRPSession("mfa:" + req.Email)
		h.Error(w, http.StatusUnauthorized, "MFA session expired, log in again")
		return
	}

	// Validate TOTP code
	secret, enabled, err := h.Store.GetMFASecret(r.Context(), entry.userID)
	if err != nil || !enabled {
		h.Error(w, http.StatusUnauthorized, "MFA not configured")
		cleanupSRPSession("mfa:" + req.Email)
		return
	}

	if !totp.Validate(req.Code, secret) {
		h.Error(w, http.StatusUnauthorized, "invalid MFA code")
		return
	}

	cleanupSRPSession("mfa:" + req.Email)

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
		User:         *user,
	})
}

// MFASetup handles POST /v1/mfa/setup — generates a new TOTP secret.
func (h *Handler) MFASetup(w http.ResponseWriter, r *http.Request) {
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

	secret, err := totp.GenerateSecret()
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to generate TOTP secret")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	if err := h.Store.UpsertMFASecret(r.Context(), userID, secret); err != nil {
		h.Log.Error().Err(err).Msg("failed to store MFA secret")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	otpURL := totp.OTPAuthURL(secret, user.Email, "Haseen")

	h.JSON(w, http.StatusOK, model.MFASetupResponse{
		Secret:     secret,
		OTPAuthURL: otpURL,
	})
}

// MFAVerifySetup handles POST /v1/mfa/verify — verify TOTP code to enable MFA.
func (h *Handler) MFAVerifySetup(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.MFAVerifySetupRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Code == "" {
		h.Error(w, http.StatusBadRequest, "code is required")
		return
	}

	secret, _, err := h.Store.GetMFASecret(r.Context(), userID)
	if err != nil || secret == "" {
		h.Error(w, http.StatusBadRequest, "set up MFA first")
		return
	}

	if !totp.Validate(req.Code, secret) {
		h.Error(w, http.StatusUnauthorized, "invalid code")
		return
	}

	if err := h.Store.EnableMFA(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to enable MFA")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// MFADisable handles DELETE /v1/mfa.
func (h *Handler) MFADisable(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if err := h.Store.DisableMFA(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to disable MFA")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}
