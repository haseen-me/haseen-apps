package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/haseen-me/haseen-apps/services/calendar/internal/model"
)

func (h *Handler) ListEvents(w http.ResponseWriter, r *http.Request) {
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")

	if startStr == "" || endStr == "" {
		httpErr(w, http.StatusBadRequest, "start and end query params required")
		return
	}

	start, err := time.Parse(time.RFC3339, startStr)
	if err != nil {
		httpErr(w, http.StatusBadRequest, "invalid start time")
		return
	}
	end, err := time.Parse(time.RFC3339, endStr)
	if err != nil {
		httpErr(w, http.StatusBadRequest, "invalid end time")
		return
	}

	var calID *string
	if cid := r.URL.Query().Get("calendarId"); cid != "" {
		calID = &cid
	}

	events, err := h.Store.ListEvents(r.Context(), userID(r), start, end, calID)
	if err != nil {
		h.handleStoreErr(w, err, "events")
		return
	}
	if events == nil {
		events = []model.Event{}
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"events": events})
}

func (h *Handler) GetEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventID")
	evt, err := h.Store.GetEvent(r.Context(), id, userID(r))
	if err != nil {
		h.handleStoreErr(w, err, "event")
		return
	}
	writeJSON(w, http.StatusOK, evt)
}

func (h *Handler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req model.CreateEventRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.CalendarID == "" || req.Title == "" || req.StartTime == "" || req.EndTime == "" {
		httpErr(w, http.StatusBadRequest, "calendarId, title, startTime, endTime required")
		return
	}
	if req.Color == "" {
		req.Color = "#2db8af"
	}

	evt, err := h.Store.CreateEvent(r.Context(), userID(r), req)
	if err != nil {
		h.handleStoreErr(w, err, "event")
		return
	}
	writeJSON(w, http.StatusCreated, evt)
}

func (h *Handler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventID")
	var req model.UpdateEventRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}

	evt, err := h.Store.UpdateEvent(r.Context(), id, userID(r), req)
	if err != nil {
		h.handleStoreErr(w, err, "event")
		return
	}
	writeJSON(w, http.StatusOK, evt)
}

func (h *Handler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventID")
	if err := h.Store.DeleteEvent(r.Context(), id, userID(r)); err != nil {
		h.handleStoreErr(w, err, "event")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

// --- Attendees ---

func (h *Handler) ListAttendees(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventID")
	attendees, err := h.Store.ListAttendees(r.Context(), eventID)
	if err != nil {
		h.handleStoreErr(w, err, "attendees")
		return
	}
	if attendees == nil {
		attendees = []model.Attendee{}
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"attendees": attendees})
}

func (h *Handler) AddAttendee(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventID")
	var req model.AddAttendeeRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.Email == "" {
		httpErr(w, http.StatusBadRequest, "email required")
		return
	}

	a, err := h.Store.AddAttendee(r.Context(), eventID, req.Email)
	if err != nil {
		h.handleStoreErr(w, err, "attendee")
		return
	}
	writeJSON(w, http.StatusCreated, a)
}

func (h *Handler) RemoveAttendee(w http.ResponseWriter, r *http.Request) {
	attendeeID := chi.URLParam(r, "attendeeID")
	if err := h.Store.RemoveAttendee(r.Context(), attendeeID); err != nil {
		h.handleStoreErr(w, err, "attendee")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) UpdateAttendeeStatus(w http.ResponseWriter, r *http.Request) {
	attendeeID := chi.URLParam(r, "attendeeID")
	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	switch req.Status {
	case "accepted", "declined", "tentative":
		// valid
	default:
		http.Error(w, "status must be accepted, declined, or tentative", http.StatusBadRequest)
		return
	}
	a, err := h.Store.UpdateAttendeeStatus(r.Context(), attendeeID, req.Status)
	if err != nil {
		h.handleStoreErr(w, err, "attendee")
		return
	}
	writeJSON(w, http.StatusOK, a)
}

// --- Reminders ---

func (h *Handler) ListReminders(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventID")
	reminders, err := h.Store.ListReminders(r.Context(), eventID)
	if err != nil {
		h.handleStoreErr(w, err, "reminders")
		return
	}
	if reminders == nil {
		reminders = []model.Reminder{}
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"reminders": reminders})
}

func (h *Handler) SetReminder(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventID")
	var req model.SetReminderRequest
	if err := decode(r, &req); err != nil {
		httpErr(w, http.StatusBadRequest, "invalid json")
		return
	}
	if req.MinutesBefore <= 0 {
		httpErr(w, http.StatusBadRequest, "minutesBefore must be positive")
		return
	}

	rem, err := h.Store.SetReminder(r.Context(), eventID, req.MinutesBefore)
	if err != nil {
		h.handleStoreErr(w, err, "reminder")
		return
	}
	writeJSON(w, http.StatusCreated, rem)
}

func (h *Handler) DeleteReminder(w http.ResponseWriter, r *http.Request) {
	reminderID := chi.URLParam(r, "reminderID")
	if err := h.Store.DeleteReminder(r.Context(), reminderID); err != nil {
		h.handleStoreErr(w, err, "reminder")
		return
	}
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}
