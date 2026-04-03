package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/model"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/store"
)

// GetPreKey handles GET /v1/prekeys/{userID} — claim one pre-key + return key bundle.
func (h *Handler) GetPreKey(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userID")
	if userID == "" {
		h.Error(w, http.StatusBadRequest, "userID required")
		return
	}

	// Get key bundle
	bundle, err := h.Store.GetActiveKeys(r.Context(), userID)
	if err == store.ErrNotFound {
		h.Error(w, http.StatusNotFound, "user has no published keys")
		return
	}
	if err != nil {
		h.Log.Error().Err(err).Msg("failed to get key bundle")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Claim a pre-key (optional — may have none)
	preKey, err := h.Store.ClaimPreKey(r.Context(), userID)
	if err != nil && err != store.ErrNotFound {
		h.Log.Error().Err(err).Msg("failed to claim pre-key")
	}

	h.JSON(w, http.StatusOK, model.PreKeyResponse{
		KeyBundle: bundle,
		PreKey:    preKey,
	})
}

// UploadPreKeys handles POST /v1/prekeys/upload — upload batch of signed pre-keys (authenticated).
func (h *Handler) UploadPreKeys(w http.ResponseWriter, r *http.Request) {
	userID := h.UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.UploadPreKeysRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if len(req.PreKeys) == 0 {
		h.Error(w, http.StatusBadRequest, "preKeys required")
		return
	}
	if len(req.PreKeys) > 100 {
		h.Error(w, http.StatusBadRequest, "maximum 100 pre-keys per upload")
		return
	}

	for _, pk := range req.PreKeys {
		if len(pk.PublicKey) == 0 || len(pk.Signature) == 0 {
			h.Error(w, http.StatusBadRequest, "each pre-key must have publicKey and signature")
			return
		}
	}

	if err := h.Store.UploadPreKeys(r.Context(), userID, req.PreKeys); err != nil {
		h.Log.Error().Err(err).Msg("failed to upload pre-keys")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}

	count, _ := h.Store.CountAvailablePreKeys(r.Context(), userID)

	h.JSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"available": count,
	})
}
