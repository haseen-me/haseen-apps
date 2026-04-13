package handler

import (
	"encoding/json"
	"net/http"
	"fmt"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/events"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/haseen-me/haseen-apps/services/mail/internal/worker"
	"github.com/rs/zerolog"
)

// Handler holds dependencies for all HTTP handlers.
type Handler struct {
	Store     *store.Store
	Log       zerolog.Logger
	Domain    string // e.g. "haseen.me"
	DNSWorker *worker.DNSWorker
	Broker    *events.Broker
}

// JSON writes a JSON response.
func (h *Handler) JSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		h.Log.Error().Err(err).Msg("json encode failed")
	}
}

// Error writes an error JSON response.
func (h *Handler) Error(w http.ResponseWriter, status int, msg string) {
	h.JSON(w, status, map[string]string{"error": msg})
}

// Decode reads JSON from the request body into v.
func (h *Handler) Decode(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

// UserID extracts the authenticated user ID from the request context.
// Set by auth middleware.
func UserID(r *http.Request) string {
	if v, ok := r.Context().Value(ctxKeyUserID).(string); ok {
		return v
	}
	return ""
}

type contextKey string

const ctxKeyUserID contextKey = "userID"

func (h *Handler) PublishEvent(userID, mailboxID, eventType, threadID, messageID, label string) {
	if h.Broker == nil || userID == "" || mailboxID == "" {
		return
	}
	h.Broker.Publish(model.MailEvent{
		ID:         fmt.Sprintf("%d", time.Now().UnixNano()),
		Type:       eventType,
		UserID:     userID,
		MailboxID:  mailboxID,
		ThreadID:   threadID,
		MessageID:  messageID,
		OccurredAt: time.Now().UTC().Format(time.RFC3339Nano),
		Label:      label,
	})
}
