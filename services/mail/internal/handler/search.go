package handler

import (
	"net/http"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// Search performs full-text search across the user's mailbox.
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)

	var req model.SearchRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Query == "" {
		h.JSON(w, http.StatusOK, model.SearchResponse{Threads: []model.Thread{}})
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	// Try full-text search first
	threads, err := h.Store.Search(ctx, mb.ID, req.Query)
	if err != nil || len(threads) == 0 {
		// Fallback to address/subject ILIKE search
		threads, err = h.Store.SearchByAddress(ctx, mb.ID, req.Query)
		if err != nil {
			h.Error(w, http.StatusInternalServerError, "search failed")
			return
		}
	}

	// Resolve labels
	labels, _ := h.Store.GetLabels(ctx, mb.ID)
	labelMap := buildLabelMap(labels)
	for i := range threads {
		threads[i].Labels = resolveLabels(threads[i].Labels, labelMap)
		for j := range threads[i].Messages {
			threads[i].Messages[j].Labels = resolveLabels(threads[i].Messages[j].Labels, labelMap)
		}
	}

	h.JSON(w, http.StatusOK, model.SearchResponse{Threads: threads})
}
