package handler

import (
"net/http"

"github.com/go-chi/chi/v5"
"github.com/haseen-me/haseen-apps/services/contacts/internal/model"
"github.com/haseen-me/haseen-apps/services/contacts/internal/store"
)

func (h *Handler) ListContacts(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
if userID == "" {
h.Error(w, http.StatusUnauthorized, "unauthorized")
return
}

contacts, err := h.Store.ListContacts(r.Context(), userID)
if err != nil {
h.Log.Error().Err(err).Msg("list contacts")
h.Error(w, http.StatusInternalServerError, "internal error")
return
}
h.JSON(w, http.StatusOK, model.ListResponse{Contacts: contacts, Total: len(contacts)})
}

func (h *Handler) GetContact(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
contactID := chi.URLParam(r, "contactID")
c, err := h.Store.GetContact(r.Context(), userID, contactID)
if err == store.ErrNotFound {
h.Error(w, http.StatusNotFound, "contact not found")
return
}
if err != nil {
h.Error(w, http.StatusInternalServerError, "internal error")
return
}
h.JSON(w, http.StatusOK, c)
}

func (h *Handler) CreateContact(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
if userID == "" {
h.Error(w, http.StatusUnauthorized, "unauthorized")
return
}
var req model.CreateContactRequest
if err := h.Decode(r, &req); err != nil {
h.Error(w, http.StatusBadRequest, "invalid request body")
return
}
if req.Email == "" {
h.Error(w, http.StatusBadRequest, "email is required")
return
}
c, err := h.Store.CreateContact(r.Context(), userID, &req)
if err != nil {
h.Log.Error().Err(err).Msg("create contact")
h.Error(w, http.StatusInternalServerError, "failed to create contact")
return
}
h.JSON(w, http.StatusCreated, c)
}

func (h *Handler) UpdateContact(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
contactID := chi.URLParam(r, "contactID")
var req model.UpdateContactRequest
if err := h.Decode(r, &req); err != nil {
h.Error(w, http.StatusBadRequest, "invalid request body")
return
}
c, err := h.Store.UpdateContact(r.Context(), userID, contactID, &req)
if err == store.ErrNotFound {
h.Error(w, http.StatusNotFound, "contact not found")
return
}
if err != nil {
h.Error(w, http.StatusInternalServerError, "internal error")
return
}
h.JSON(w, http.StatusOK, c)
}

func (h *Handler) DeleteContact(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
contactID := chi.URLParam(r, "contactID")
err := h.Store.DeleteContact(r.Context(), userID, contactID)
if err == store.ErrNotFound {
h.Error(w, http.StatusNotFound, "contact not found")
return
}
if err != nil {
h.Error(w, http.StatusInternalServerError, "internal error")
return
}
h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

func (h *Handler) SearchContacts(w http.ResponseWriter, r *http.Request) {
userID := UserID(r)
if userID == "" {
h.Error(w, http.StatusUnauthorized, "unauthorized")
return
}
var req model.SearchRequest
if err := h.Decode(r, &req); err != nil {
h.Error(w, http.StatusBadRequest, "invalid request body")
return
}
if req.Query == "" {
h.Error(w, http.StatusBadRequest, "query is required")
return
}
contacts, err := h.Store.SearchContacts(r.Context(), userID, req.Query)
if err != nil {
h.Log.Error().Err(err).Msg("search contacts")
h.Error(w, http.StatusInternalServerError, "internal error")
return
}
h.JSON(w, http.StatusOK, model.ListResponse{Contacts: contacts, Total: len(contacts)})
}
