package handler

import (
	"fmt"
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

// ListFiles returns all files for the current user.
func (h *Handler) ListFiles(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(r)
	files, err := h.Store.GetAllFiles(ctx, uid)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to list files")
		return
	}
	h.JSON(w, http.StatusOK, model.FileListResponse{Files: files, Total: len(files)})
}

// GetFile returns file metadata.
func (h *Handler) GetFile(w http.ResponseWriter, r *http.Request) {
	fileID := chi.URLParam(r, "fileID")
	uid := UserID(r)
	f, err := h.Store.GetFile(r.Context(), uid, fileID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found")
		return
	}
	h.JSON(w, http.StatusOK, f)
}

// UploadFile handles multipart file upload.
func (h *Handler) UploadFile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(r)

	// 100MB max
	r.Body = http.MaxBytesReader(w, r.Body, 100<<20)
	if err := r.ParseMultipartForm(32 << 20); err != nil {
		h.Error(w, http.StatusBadRequest, "request too large or invalid multipart")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		h.Error(w, http.StatusBadRequest, "missing file field")
		return
	}
	defer file.Close()

	name := header.Filename
	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	folderID := r.FormValue("folderId")
	var folderPtr *string
	if folderID != "" {
		folderPtr = &folderID
	}

	// Store blob
	blobPath, size, err := h.Blob.Store(file)
	if err != nil {
		h.Log.Error().Err(err).Msg("blob store failed")
		h.Error(w, http.StatusInternalServerError, "failed to store file")
		return
	}

	// Store metadata in DB
	// Use client-provided encrypted content key
	encKeyStr := r.FormValue("encryptedKey")
	encKey := []byte(encKeyStr)
	if len(encKey) == 0 {
		encKey = []byte("unencrypted")
	}
	f, err := h.Store.CreateFile(ctx, uid, name, mimeType, size, folderPtr, blobPath, encKey)
	if err != nil {
		h.Blob.Delete(blobPath)
		h.Log.Error().Err(err).Msg("db store failed")
		h.Error(w, http.StatusInternalServerError, "failed to save file metadata")
		return
	}

	h.JSON(w, http.StatusCreated, f)
}

// UpdateFile updates file name or folder.
func (h *Handler) UpdateFile(w http.ResponseWriter, r *http.Request) {
	fileID := chi.URLParam(r, "fileID")
	uid := UserID(r)
	var req model.UpdateFileRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	f, err := h.Store.UpdateFile(r.Context(), uid, fileID, req.Name, req.FolderID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found")
		return
	}
	h.JSON(w, http.StatusOK, f)
}

// DeleteFile removes a file and its blob.
func (h *Handler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	fileID := chi.URLParam(r, "fileID")
	uid := UserID(r)
	blobPath, err := h.Store.DeleteFile(r.Context(), uid, fileID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found")
		return
	}
	h.Blob.Delete(blobPath)
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// MoveFile moves a file to a different folder.
func (h *Handler) MoveFile(w http.ResponseWriter, r *http.Request) {
	fileID := chi.URLParam(r, "fileID")
	uid := UserID(r)
	var req model.MoveRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	f, err := h.Store.MoveFile(r.Context(), uid, fileID, req.FolderID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found")
		return
	}
	h.JSON(w, http.StatusOK, f)
}

// DownloadFile serves the raw blob data.
func (h *Handler) DownloadFile(w http.ResponseWriter, r *http.Request) {
	fileID := chi.URLParam(r, "fileID")
	uid := UserID(r)
	f, err := h.Store.GetFile(r.Context(), uid, fileID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "file not found")
		return
	}

	reader, err := h.Blob.Open(f.BlobPath)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to read file")
		return
	}
	defer reader.Close()

	w.Header().Set("Content-Type", f.MimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", f.Name))
	w.Header().Set("Content-Length", fmt.Sprintf("%d", f.Size))
	io.Copy(w, reader)
}

// ShareFile creates a share for a file.
func (h *Handler) ShareFile(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	fileID := chi.URLParam(r, "fileID")

	var req model.ShareRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Email == "" {
		h.Error(w, http.StatusBadRequest, "email is required")
		return
	}
	if req.Permission == "" {
		req.Permission = "read"
	}

	// Look up shared-with user
	sharedWithID, err := h.Store.GetUserByEmail(ctx, req.Email)
	if err != nil {
		h.Error(w, http.StatusNotFound, "user not found")
		return
	}

	// Use client-provided encrypted share key
	encKey := []byte(req.EncryptedKey)
	if len(encKey) == 0 {
		h.Error(w, http.StatusBadRequest, "encryptedKey is required")
		return
	}
	share, err := h.Store.CreateShare(ctx, &fileID, nil, sharedWithID, encKey, req.Permission)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to create share")
		return
	}
	h.JSON(w, http.StatusCreated, share)
}
