package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/haseen-me/haseen-apps/services/calendar/internal/model"
)

func (h *Handler) ListCalendars(w http.ResponseWriter, r *http.Request) {
	cals, err := h.Store.ListCalendars(r.Context(), userID(r))
	if err != nil {
		h.handleStoreErr(w, err, "calendars")
		return
	}
	if cals == nil {
		cals = []model.Calendar{}
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"calendars": cals})
}

func (h *Handler) CreateCalendar(w http.ResponseWriter, r *http.Request) {
	var req model.CreateCalendarRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Name == "" {
		httpErr(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Color == "" {
		req.Color = "#2db8af"
	}

	cal, err := h.Store.CreateCalendar(r.Context(), userID(r), req.Name, req.Color)
	if err != nil {
		h.handleStoreErr(w, err, "calendar")
		return
	}
	writeJSON(w, http.StatusCreated, cal)
}

func (h *Handler) UpdateCalendar(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "calendarID")
	var req model.UpdateCalendarRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}

	cal, err := h.Store.UpdateCalendar(r.Context(), id, userID(r), req.Name, req.Color)
	if err != nil {
		h.handleStoreErr(w, err, "calendar")
		return
	}
	writeJSON(w, http.StatusOK, cal)
}

func (h *Handler) DeleteCalendar(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "calendarID")
	if err := h.Store.DeleteCalendar(r.Context(), id, userID(r)); err != nil {
		h.handleStoreErr(w, err, "calendar")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
