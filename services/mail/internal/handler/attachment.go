package handler

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// GetAttachment serves the raw attachment data as a download.
func (h *Handler) GetAttachment(w http.ResponseWriter, r *http.Request) {
	attID := chi.URLParam(r, "attachmentID")

	data, filename, mimeType, err := h.Store.GetAttachmentData(r.Context(), attID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "attachment not found")
		return
	}

	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Content-Disposition", "attachment; filename=\""+filename+"\"")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(data)))
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
