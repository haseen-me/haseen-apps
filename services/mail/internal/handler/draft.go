package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// SaveDraft stores a message in the user's Drafts folder.
func (h *Handler) SaveDraft(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)

	var req model.SendMessageRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	senderEmail, err := h.Store.GetUserEmail(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to get sender address")
		return
	}
	fromAddr := model.EmailAddress{Address: senderEmail}

	draftsLabel, err := h.Store.GetLabelByName(ctx, mb.ID, "Drafts")
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "drafts label not found")
		return
	}

	threadID, err := h.Store.CreateThread(ctx, mb.ID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to create thread")
		return
	}

	msgID, err := h.Store.CreateMessage(ctx, mb.ID, threadID, &req, fromAddr, draftsLabel.ID)
	if err != nil {
		h.Log.Error().Err(err).Msg("save draft")
		h.Error(w, http.StatusInternalServerError, "failed to save draft")
		return
	}

	h.JSON(w, http.StatusCreated, model.SendResponse{ID: msgID})
}

// UpdateDraft replaces the content of an existing draft.
func (h *Handler) UpdateDraft(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)
	draftID := chi.URLParam(r, "messageID")

	var req model.SendMessageRequest
	if err := h.Decode(r, &req); err != nil {
		h.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	// Verify draft exists and is in Drafts label
	draftsLabel, err := h.Store.GetLabelByName(ctx, mb.ID, "Drafts")
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "drafts label not found")
		return
	}

	msg, err := h.Store.GetMessage(ctx, mb.ID, draftID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "draft not found")
		return
	}

	// Check it's actually a draft
	if len(msg.Labels) == 0 || msg.Labels[0] != draftsLabel.ID {
		h.Error(w, http.StatusBadRequest, "message is not a draft")
		return
	}

	if err := h.Store.UpdateDraftContent(ctx, mb.ID, draftID, &req); err != nil {
		h.Log.Error().Err(err).Msg("update draft")
		h.Error(w, http.StatusInternalServerError, "failed to update draft")
		return
	}

	h.JSON(w, http.StatusOK, model.OkResponse{OK: true})
}

// SendDraft sends an existing draft and moves it to Sent.
func (h *Handler) SendDraft(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID := UserID(r)
	draftID := chi.URLParam(r, "messageID")

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	msg, err := h.Store.GetMessage(ctx, mb.ID, draftID)
	if err != nil {
		h.Error(w, http.StatusNotFound, "draft not found")
		return
	}

	// Move to Sent
	sentLabel, err := h.Store.GetLabelByName(ctx, mb.ID, "Sent")
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "sent label not found")
		return
	}

	if _, err := h.Store.MoveMessage(ctx, mb.ID, draftID, sentLabel.ID); err != nil {
		h.Error(w, http.StatusInternalServerError, "failed to move draft to sent")
		return
	}

	// Deliver to recipients
	senderEmail, _ := h.Store.GetUserEmail(ctx, userID)
	fromAddr := model.EmailAddress{Address: senderEmail}
	req := model.SendMessageRequest{
		To:       msg.To,
		Cc:       msg.Cc,
		Bcc:      msg.Bcc,
		Subject:  msg.Subject,
		BodyHtml: msg.BodyHtml,
	}
	go h.deliverToRecipients(req, fromAddr, senderEmail, userID)

	h.JSON(w, http.StatusOK, model.SendResponse{ID: draftID})
}
