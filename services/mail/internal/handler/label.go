package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// CreateLabel creates a new user label.
func (h *Handler) CreateLabel(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)

	var req model.CreateLabelRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		h.Error(w, http.StatusBadRequest, "name is required")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	label, err := h.Store.CreateLabel(ctx, mb.ID, req.Name, req.Color)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to create label")
		return
	}
	h.JSON(w, http.StatusCreated, label)
}

// UpdateLabel updates a user label.
func (h *Handler) UpdateLabel(w http.ResponseWriter, r *http.Request) {
	labelID := chi.URLParam(r, "labelID")

	var req model.UpdateLabelRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	label, err := h.Store.UpdateLabel(r.Context(), labelID, req.Name, req.Color)
	if err != nil {
		h.Error(w, http.StatusNotFound, "label not found or is a system label")
		return
	}
	h.JSON(w, http.StatusOK, label)
}

// DeleteLabel deletes a user label.
func (h *Handler) DeleteLabel(w http.ResponseWriter, r *http.Request) {
	labelID := chi.URLParam(r, "labelID")
	if err := h.Store.DeleteLabel(r.Context(), labelID); err != nil {
		h.Error(w, http.StatusNotFound, "label not found or is a system label")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}
