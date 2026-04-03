package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/rs/zerolog"

	"github.com/haseen-me/haseen-apps/services/calendar/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/calendar/internal/store"
)

type Handler struct {
	Store *store.Store
	Log   zerolog.Logger
}

func userID(r *http.Request) string {
	return middleware.UserID(r.Context())
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func httpErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func decode(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

func (h *Handler) handleStoreErr(w http.ResponseWriter, err error, entity string) {
	if errors.Is(err, store.ErrNotFound) {
		httpErr(w, http.StatusNotFound, entity+" not found")
		return
	}
	h.Log.Error().Err(err).Str("entity", entity).Msg("store error")
	httpErr(w, http.StatusInternalServerError, "internal error")
}
