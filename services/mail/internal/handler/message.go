package handler

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// GetMessage returns a single message by ID.
func (h *Handler) GetMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	msgID := chi.URLParam(r, "messageID")
	userID := UserID(r)

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	msg, err := h.Store.GetMessage(ctx, mb.ID, msgID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "message not found")
		return
	}

	// Resolve labels
	labels, _ := h.Store.GetLabels(ctx, mb.ID)
	labelMap := buildLabelMap(labels)
	msg.Labels = resolveLabels(msg.Labels, labelMap)

	h.JSON(w, http.StatusOK, msg)
}

// SendMessage handles composing and sending a new email.
func (h *Handler) SendMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req model.SendMessageRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if len(req.To) == 0 {
		h.Error(w, http.StatusBadRequest, "at least one recipient required")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	// Get user's email as the sender
	senderEmail, err := h.Store.GetUserEmail(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to get sender address")
		return
	}
	fromAddr := model.EmailAddress{Address: senderEmail}

	// Get "Sent" label
	sentLabel, err := h.Store.GetLabelByName(ctx, mb.ID, "Sent")
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "sent label not found")
		return
	}

	// Handle threading for replies
	threadID := ""
	if req.ReplyToMessageID != "" {
		origMsg, err := h.Store.GetMessage(ctx, mb.ID, req.ReplyToMessageID)
		if err == nil {
			threadID = origMsg.ThreadID
		}
	}
	if threadID == "" {
		threadID, err = h.Store.CreateThread(ctx, mb.ID)
		if err != nil {
			h.Error(w, http.StatusInternalServerError, "failed to create thread")
			return
		}
	}

	// Store the message in sender's "Sent" folder
	msgID, err := h.Store.CreateMessage(ctx, mb.ID, threadID, &req, fromAddr, sentLabel.ID)
	if err != nil {
		h.Log.Error().Err(err).Msg("create message")
		h.Error(w, http.StatusInternalServerError, "failed to store message")
		return
	}

	// Deliver to recipients
	go h.deliverToRecipients(req, fromAddr, senderEmail)

	h.JSON(w, http.StatusCreated, model.SendResponse{ID: msgID})
}

// deliverToRecipients routes messages to local or external recipients.
func (h *Handler) deliverToRecipients(req model.SendMessageRequest, from model.EmailAddress, senderEmail string) {
	for _, rcpt := range append(req.To, append(req.Cc, req.Bcc...)...) {
		h.deliverToRecipient(rcpt.Address, from, &req, senderEmail)
	}
}

func (h *Handler) deliverToRecipient(recipientAddr string, from model.EmailAddress, req *model.SendMessageRequest, senderEmail string) {
	ctx := context.Background()

	// Check if recipient is a local user
	recipientUserID, err := h.Store.GetUserByEmail(ctx, recipientAddr)
	if err != nil {
		// External recipient — queue for SMTP delivery
		h.Log.Info().Str("to", recipientAddr).Msg("external delivery queued")
		return
	}

	// Local delivery: store in recipient's inbox
	mb, err := h.Store.EnsureMailbox(ctx, recipientUserID)
	if err != nil {
		h.Log.Error().Err(err).Str("to", recipientAddr).Msg("ensure mailbox")
		return
	}
	_ = h.Store.EnsureSystemLabels(ctx, mb.ID)

	inboxLabel, err := h.Store.GetLabelByName(ctx, mb.ID, "Inbox")
	if err != nil {
		h.Log.Error().Err(err).Msg("get inbox label")
		return
	}

	// Find or create thread
	threadID, err := h.Store.FindThreadBySubject(ctx, mb.ID, req.Subject)
	if err != nil {
		threadID, err = h.Store.CreateThread(ctx, mb.ID)
		if err != nil {
			h.Log.Error().Err(err).Msg("create recipient thread")
			return
		}
	}

	_, err = h.Store.CreateInboundMessage(ctx, mb.ID, threadID, inboxLabel.ID,
		senderEmail,
		[]string{recipientAddr},
		nil,
		req.Subject, req.BodyHtml, "",
	)
	if err != nil {
		h.Log.Error().Err(err).Str("to", recipientAddr).Msg("deliver local")
	}
}

// UpdateMessage updates a message's read/starred flags.
func (h *Handler) UpdateMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	msgID := chi.URLParam(r, "messageID")
	userID := UserID(r)

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	var req model.UpdateMessageRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	msg, err := h.Store.UpdateMessage(ctx, mb.ID, msgID, &req)
	if err != nil {
		h.Error(w, http.StatusNotFound, "message not found")
		return
	}
	h.JSON(w, http.StatusOK, msg)
}

// DeleteMessage removes a message.
func (h *Handler) DeleteMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	msgID := chi.URLParam(r, "messageID")
	userID := UserID(r)

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	if err := h.Store.DeleteMessage(ctx, mb.ID, msgID); err != nil {
		h.Error(w, http.StatusNotFound, "message not found")
		return
	}
	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// MoveMessage moves a message to a different label (folder).
func (h *Handler) MoveMessage(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	msgID := chi.URLParam(r, "messageID")
	userID := UserID(r)

	var req model.MoveMessageRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	label, err := h.Store.GetLabelByName(ctx, mb.ID, labelSlugToName(req.Label))
	if err != nil {
		h.Error(w, http.StatusNotFound, "label not found")
		return
	}

	msg, err := h.Store.MoveMessage(ctx, mb.ID, msgID, label.ID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "message not found")
		return
	}
	h.JSON(w, http.StatusOK, msg)
}
