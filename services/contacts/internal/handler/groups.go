package handler

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/contacts/internal/model"
)

func (h *Handler) ListGroups(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	groups, err := h.Store.ListGroups(r.Context(), userID)
	if err != nil {
		h.Log.Error().Err(err).Msg("list groups")
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.GroupListResponse{Groups: groups})
}

func (h *Handler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	var req model.CreateGroupRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.Name == "" {
		h.Error(w, http.StatusBadRequest, "name is required")
		return
	}
	g, err := h.Store.CreateGroup(r.Context(), userID, &req)
	if err != nil {
		h.Log.Error().Err(err).Msg("create group")
		h.Error(w, http.StatusInternalServerError, "failed to create group")
		return
	}
	h.JSON(w, http.StatusCreated, g)
}

func (h *Handler) UpdateGroup(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	groupID := chi.URLParam(r, "groupID")
	var req model.UpdateGroupRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	g, err := h.Store.UpdateGroup(r.Context(), userID, groupID, &req)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, g)
}

func (h *Handler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	groupID := chi.URLParam(r, "groupID")
	err := h.Store.DeleteGroup(r.Context(), userID, groupID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

func (h *Handler) AddToGroup(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	groupID := chi.URLParam(r, "groupID")
	var body struct {
		ContactID string `json:"contactId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ContactID == "" {
		h.Error(w, http.StatusBadRequest, "contactId is required")
		return
	}
	if err := h.Store.AddContactToGroup(r.Context(), userID, groupID, body.ContactID); err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

func (h *Handler) RemoveFromGroup(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	groupID := chi.URLParam(r, "groupID")
	contactID := chi.URLParam(r, "contactID")
	if err := h.Store.RemoveContactFromGroup(r.Context(), userID, groupID, contactID); err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

func (h *Handler) GetGroupMembers(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	groupID := chi.URLParam(r, "groupID")
	ids, err := h.Store.GetGroupMembers(r.Context(), userID, groupID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "internal error")
		return
	}
	h.JSON(w, http.StatusOK, model.GroupMembersResponse{ContactIDs: ids})
}
