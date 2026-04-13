package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func (h *Handler) StreamEvents(w http.ResponseWriter, r *http.Request) {
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	if h.Broker == nil {
		h.Error(w, http.StatusServiceUnavailable, "event stream unavailable")
		return
	}

	mb, err := h.Store.GetMailboxByUser(r.Context(), userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	flusher, ok := w.(http.Flusher)
	if !ok {
		h.Error(w, http.StatusInternalServerError, "streaming unsupported")
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")

	ch, unsubscribe := h.Broker.Subscribe(userID)
	defer unsubscribe()

	keepAlive := time.NewTicker(20 * time.Second)
	defer keepAlive.Stop()

	hello := map[string]any{
		"id":         fmt.Sprintf("%d", time.Now().UnixNano()),
		"type":       "message.updated",
		"userId":     userID,
		"mailboxId":  mb.ID,
		"occurredAt": time.Now().UTC().Format(time.RFC3339Nano),
	}
	if payload, err := json.Marshal(hello); err == nil {
		fmt.Fprintf(w, "data: %s\n\n", payload)
		flusher.Flush()
	}

	for {
		select {
		case <-r.Context().Done():
			return
		case event, ok := <-ch:
			if !ok {
				return
			}
			payload, err := json.Marshal(event)
			if err != nil {
				continue
			}
			fmt.Fprintf(w, "id: %s\n", event.ID)
			fmt.Fprintf(w, "data: %s\n\n", payload)
			flusher.Flush()
		case <-keepAlive.C:
			fmt.Fprint(w, ": ping\n\n")
			flusher.Flush()
		}
	}
}
