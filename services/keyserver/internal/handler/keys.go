package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/model"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/store"
)

// GetKeys handles GET /v1/keys/{userID} — returns a user's active key bundle.
func (h *Handler) GetKeys(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if userID == "" {
		h.Error(w, http.StatusBadRequest, "userID required")
		return
	}

	bundle, err := h.Store.GetActiveKeys(r.Context(), userID)
	if err == store.ErrNotFound {
		h.Error(w, http.StatusNotFound, "no keys found")
		return
	}
	if err != nil {
		h.Log.Error().Err(err).Str("userID", userID).Msg("failed to get keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, bundle)
}

// GetSigningKey handles GET /v1/keys/{userID}/signing — returns just the signing key.
func (h *Handler) GetSigningKey(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if userID == "" {
		h.Error(w, http.StatusBadRequest, "userID required")
		return
	}

	key, err := h.Store.GetSigningKey(r.Context(), userID)
	if err == store.ErrNotFound {
		h.Error(w, http.StatusNotFound, "no signing key found")
		return
	}
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to get signing key")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, map[string]any{
		"userId":     userID,
		"signingKey": key,
	})
}

// Lookup handles POST /v1/keys/lookup — batch lookup of multiple users' keys.
func (h *Handler) Lookup(w http.ResponseWriter, r *http.Request) {
	var req model.LookupRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.UserIDs) == 0 {
		h.Error(w, http.StatusBadRequest, "userIds required")
		return
	}
	if len(req.UserIDs) > 100 {
		h.Error(w, http.StatusBadRequest, "maximum 100 users per lookup")
		return
	}

	keys, err := h.Store.BatchLookup(r.Context(), req.UserIDs)
	if err != nil {
		h.Log.Error().Err(err).Msg("batch lookup failed")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.LookupResponse{Keys: keys})
}

// Publish handles POST /v1/keys/publish — publish a new key bundle (authenticated).
func (h *Handler) Publish(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.PublishRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.EncryptionPublicKey) == 0 || len(req.SigningPublicKey) == 0 {
		h.Error(w, http.StatusBadRequest, "encryptionPublicKey and signingPublicKey required")
		return
	}

	sig := req.SelfSignature
	if sig == nil {
		sig = []byte{}
	}

	bundle, err := h.Store.PublishKeys(r.Context(), userID, req.EncryptionPublicKey, req.SigningPublicKey, sig)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to publish keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusCreated, bundle)
}

// Rotate handles POST /v1/keys/rotate — revoke old keys + publish new (authenticated).
func (h *Handler) Rotate(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.RotateRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.NewEncryptionPublicKey) == 0 || len(req.NewSigningPublicKey) == 0 {
		h.Error(w, http.StatusBadRequest, "new keys are required")
		return
	}

	sig := req.NewSelfSignature
	if sig == nil {
		sig = []byte{}
	}

	bundle, err := h.Store.RotateKeys(r.Context(), userID, req.NewEncryptionPublicKey, req.NewSigningPublicKey, sig)
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to rotate keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, bundle)
}

// Revoke handles POST /v1/keys/revoke — revoke all active key bundles (authenticated).
func (h *Handler) Revoke(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	if err := h.Store.RevokeKeys(r.Context(), userID); err != nil {
		h.Log.Error().Err(err).Msg("failed to revoke keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}
