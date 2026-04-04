package handler

import (
	"fmt"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// UploadAttachment handles POST /messages/{messageID}/attachments — multipart file upload.
func (h *Handler) UploadAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	messageID := chi.URLParam(r, "messageID")
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Verify ownership: message must belong to user's mailbox
	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}
	if _, err := h.Store.GetMessage(ctx, mb.ID, messageID); err != nil {
		h.Error(w, http.StatusNotFound, "message not found")
		return
	}

	// 10 MB max
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		h.Error(w, http.StatusBadRequest, "file too large or invalid multipart")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		h.Error(w, http.StatusBadRequest, "missing file field")
		return
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to read file")
		return
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	attID, err := h.Store.CreateAttachment(ctx, messageID, header.Filename, mimeType, int64(len(data)), data)
	if err != nil {
		h.Log.Error().Err(err).Msg("create attachment")
		h.Error(w, http.StatusInternalServerError, "failed to store attachment")
		return
	}

	h.JSON(w, http.StatusCreated, map[string]string{"id": attID})
}

// GetAttachment serves the raw attachment data as a download.
func (h *Handler) GetAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	attID := chi.URLParam(r, "attachmentID")
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Verify ownership: attachment's message must belong to user's mailbox
	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusForbidden, "access denied")
		return
	}

	data, filename, mimeType, err := h.Store.GetAttachmentDataForMailbox(ctx, attID, mb.ID)
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
