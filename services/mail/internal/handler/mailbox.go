package handler

import (
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// GetMailbox returns threads for the default label (inbox).
func (h *Handler) GetMailbox(w http.ResponseWriter, r *http.Request) {
	h.getMailboxByLabel(w, r, "inbox")
}

// GetMailboxByLabel returns threads for a specific label.
func (h *Handler) GetMailboxByLabel(w http.ResponseWriter, r *http.Request) {
	label := chi.URLParam(r, "label")
	h.getMailboxByLabel(w, r, label)
}

func (h *Handler) getMailboxByLabel(w http.ResponseWriter, r *http.Request, labelSlug string) {
	ctx := r.Context()
	userID := UserID(r)
	if userID == "" {
		h.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	mb, err := h.Store.GetMailboxByUser(ctx, userID)
	if err != nil {
		h.Error(w, http.StatusInternalServerError, "mailbox not found")
		return
	}

	// Resolve label slug to label ID
	labelName := labelSlugToName(labelSlug)
	label, err := h.Store.GetLabelByName(ctx, mb.ID, labelName)
	if err != nil {
		h.Error(w, http.StatusNotFound, "label not found")
		return
	}

	threads, err := h.Store.GetThreadsByLabel(ctx, mb.ID, label.ID)
	if err != nil {
		h.Log.Error().Err(err).Msg("get threads")
		h.Error(w, http.StatusInternalServerError, "failed to get threads")
		return
	}

	// Replace label IDs with slugs in the response
	labels, _ := h.Store.GetLabels(ctx, mb.ID)
	labelMap := buildLabelMap(labels)
	for i := range threads {
		threads[i].Labels = resolveLabels(threads[i].Labels, labelMap)
		for j := range threads[i].Messages {
			threads[i].Messages[j].Labels = resolveLabels(threads[i].Messages[j].Labels, labelMap)
		}
	}

	h.JSON(w, http.StatusOK, model.MailboxResponse{
		Threads: threads,
		Total:   len(threads),
	})
}

// labelSlugToName converts a URL slug like "inbox" to the DB label name "Inbox".
func labelSlugToName(slug string) string {
	slug = strings.ToLower(strings.TrimSpace(slug))
	switch slug {
	case "inbox":
		return "Inbox"
	case "starred":
		return "Starred"
	case "sent":
		return "Sent"
	case "drafts":
		return "Drafts"
	case "archive":
		return "Archive"
	case "spam":
		return "Spam"
	case "trash":
		return "Trash"
	default:
		return slug
	}
}

// labelNameToSlug converts DB label name to URL slug.
func labelNameToSlug(name string) string {
	return strings.ToLower(name)
}

// buildLabelMap creates a map from label ID to slug.
func buildLabelMap(labels []model.Label) map[string]string {
	m := make(map[string]string, len(labels))
	for _, l := range labels {
		m[l.ID] = labelNameToSlug(l.Name)
	}
	return m
}

// resolveLabels replaces label IDs with human-readable slugs.
func resolveLabels(ids []string, labelMap map[string]string) []string {
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		if slug, ok := labelMap[id]; ok {
			out = append(out, slug)
		} else {
			out = append(out, id)
		}
	}
	return out
}
