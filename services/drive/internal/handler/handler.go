package handler

import (
	"encoding/json"
	"net/http"

	"github.com/haseen-me/haseen-apps/services/drive/internal/blob"
	"github.com/haseen-me/haseen-apps/services/drive/internal/store"
	"github.com/rs/zerolog"
)

type Handler struct {
	Store *store.Store
	Blob  *blob.Storage
	Log   zerolog.Logger
}

func (h *Handler) JSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func (h *Handler) Error(w http.ResponseWriter, status int, msg string) {
	h.JSON(w, status, map[string]string{"error": msg})
}

func (h *Handler) Decode(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

func UserID(r *http.Request) string {
	if v, ok := r.Context().Value(ctxKeyUserID).(string); ok {
		return v
	}
	return ""
}

type contextKey string

const ctxKeyUserID contextKey = "userID"
