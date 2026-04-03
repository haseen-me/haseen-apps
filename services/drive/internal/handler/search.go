package handler

import (
	"net/http"

	"github.com/haseen-me/haseen-apps/services/drive/internal/model"
)

// Search searches files and folders by name.
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	uid := UserID(r)

	var req model.SearchRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Query == "" {
		h.JSON(w, http.StatusOK, model.SearchResponse{Files: []model.File{}, Folders: []model.Folder{}})
		return
	}

	files, _ := h.Store.SearchFiles(ctx, uid, req.Query)
	folders, _ := h.Store.SearchFolders(ctx, uid, req.Query)

	h.JSON(w, http.StatusOK, model.SearchResponse{
		Files:   files,
		Folders: folders,
	})
}
