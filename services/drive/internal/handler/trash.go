package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
)

// ListTrash returns all soft-deleted files for the current user.
func (h *Handler) ListTrash(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	files, err := h.Store.ListTrash(r.Context(), uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list trash")
		return
	}
	h.JSON(w, http.StatusOK, map[string]interface{}{"files": files})
}

// RestoreFile un-deletes a soft-deleted file.
func (h *Handler) RestoreFile(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	fileID := chi.URLParam(r, "fileID")
	f, err := h.Store.RestoreFile(r.Context(), uid, fileID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found in trash")
		return
	}
	h.JSON(w, http.StatusOK, f)
}

// EmptyTrash permanently deletes all trashed files and their blobs.
func (h *Handler) EmptyTrash(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	paths, err := h.Store.EmptyTrash(r.Context(), uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to empty trash")
		return
	}
	// Clean up blob files asynchronously
	for _, p := range paths {
		_ = h.Blob.Delete(p)
	}
	h.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// SharedWithMe returns files that other users have shared with the current user.
func (h *Handler) SharedWithMe(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	files, err := h.Store.GetSharedWithUser(r.Context(), uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list shared files")
		return
	}
	h.JSON(w, http.StatusOK, map[string]interface{}{"files": files})
}

// StorageUsage returns the total bytes used and quota for the current user.
func (h *Handler) StorageUsage(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	usedBytes, err := h.Store.GetStorageUsage(r.Context(), uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to get storage usage")
		return
	}
	// Default quota: 10 GB
	const totalBytes int64 = 10 * 1024 * 1024 * 1024
	h.JSON(w, http.StatusOK, map[string]interface{}{"usedBytes": usedBytes, "totalBytes": totalBytes})
}

// StarFile toggles the starred flag on a file.
func (h *Handler) StarFile(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	fileID := chi.URLParam(r, "fileID")
	var req struct {
		Starred bool `json:"starred"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := h.Store.StarFile(r.Context(), uid, fileID, req.Starred); err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to star file")
		return
	}
	h.JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// ListStarred returns all starred files for the current user.
func (h *Handler) ListStarred(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	files, err := h.Store.ListStarred(r.Context(), uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list starred files")
		return
	}
	h.JSON(w, http.StatusOK, map[string]interface{}{"files": files})
}
