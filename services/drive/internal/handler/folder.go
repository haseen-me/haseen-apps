package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

// GetFolder returns folder contents (subfolders + files + breadcrumb path).
func (h *Handler) GetFolder(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(r)
	folderID := chi.URLParam(r, "folderID")

	// "root" means top-level (no parent)
	if folderID == "root" {
		folders, _ := h.Store.GetSubfolders(ctx, uid, nil)
		files, _ := h.Store.GetFilesByFolder(ctx, uid, nil)
		h.JSON(w, http.StatusOK, model.FolderContents{
			Folder:  nil,
			Folders: folders,
			Files:   files,
			Path:    []model.Folder{},
		})
		return
	}

	folder, err := h.Store.GetFolder(ctx, folderID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "folder not found")
		return
	}

	subfolders, _ := h.Store.GetSubfolders(ctx, uid, &folderID)
	files, _ := h.Store.GetFilesByFolder(ctx, uid, &folderID)
	path, _ := h.Store.GetFolderPath(ctx, folderID)

	h.JSON(w, http.StatusOK, model.FolderContents{
		Folder:  folder,
		Folders: subfolders,
		Files:   files,
		Path:    path,
	})
}

// CreateFolder creates a new folder.
func (h *Handler) CreateFolder(w http.ResponseWriter, r *http.Request) {
	uid := UserID(r)
	var req model.CreateFolderRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		h.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	folder, err := h.Store.CreateFolder(r.Context(), uid, req.Name, req.ParentID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to create folder")
		return
	}
	h.JSON(w, http.StatusCreated, folder)
}

// DeleteFolder removes a folder (cascade deletes contents).
func (h *Handler) DeleteFolder(w http.ResponseWriter, r *http.Request) {
	folderID := chi.URLParam(r, "folderID")
	if err := h.Store.DeleteFolder(r.Context(), folderID); err != nil {
		h.Error(w, http.StatusNotFound, "folder not found")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// RenameFolder updates a folder's name.
func (h *Handler) RenameFolder(w http.ResponseWriter, r *http.Request) {
	folderID := chi.URLParam(r, "folderID")
	var req struct {
		Name string `json:"name"`
	}
	if err := h.Decode(r, &req); err != nil || req.Name == "" {
		h.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	folder, err := h.Store.RenameFolder(r.Context(), folderID, req.Name)
	if err != nil {
		h.Error(w, http.StatusNotFound, "folder not found")
		return
	}
	h.JSON(w, http.StatusOK, folder)
}
