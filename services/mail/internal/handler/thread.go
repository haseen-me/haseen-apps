package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

// GetThread returns a thread with all its messages.
func (h *Handler) GetThread(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	threadID := chi.URLParam(r, "threadID")

	thread, err := h.Store.GetThread(ctx, threadID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "thread not found")
		return
	}

	// Resolve label IDs to slugs
	userID := UserID(r)
	if mb, err := h.Store.GetMailboxByUser(ctx, userID); err == nil {
		labels, _ := h.Store.GetLabels(ctx, mb.ID)
		labelMap := buildLabelMap(labels)
		thread.Labels = resolveLabels(thread.Labels, labelMap)
		for j := range thread.Messages {
			thread.Messages[j].Labels = resolveLabels(thread.Messages[j].Labels, labelMap)
		}
	}

	h.JSON(w, http.StatusOK, thread)
}
