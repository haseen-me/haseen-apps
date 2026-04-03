package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
	"github.com/rs/zerolog"
)

type Handler struct {
	Store *store.Store
	Log   zerolog.Logger
}

func (h *Handler) JSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(v)
}

func (h *Handler) Error(w http.ResponseWriter, code int, msg string) {
	h.JSON(w, code, map[string]string{"error": msg})
}

func (h *Handler) Decode(r *http.Request, v any) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

// UserID extracts the user ID from context (set by auth middleware).
func (h *Handler) UserID(r *http.Request) string {
	v := r.Context().Value(ctxKeyUserID)
	if v == nil {
		return ""
	}
	return v.(string)
}

// Token extracts the Bearer token from the request.
func (h *Handler) Token(r *http.Request) string {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(auth, "Bearer ")
}

type contextKey string

const ctxKeyUserID contextKey = "userID"
