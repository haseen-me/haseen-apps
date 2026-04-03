package store

import (
	"context"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// GetThreadsByLabel returns threads for a mailbox filtered by label name.
// It builds full Thread objects with messages, unread counts, etc.
func (s *Store) GetThreadsByLabel(ctx context.Context, mailboxID, labelID string) ([]model.Thread, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT DISTINCT t.id, t.created_at
		 FROM mail_threads t
		 JOIN mail_messages m ON m.thread_id = t.id
		 WHERE t.mailbox_id = $1 AND m.label_id = $2
		 ORDER BY t.created_at DESC
		 LIMIT 100`,
		mailboxID, labelID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threadIDs []string
	for rows.Next() {
		var id string
		var created time.Time
		if err := rows.Scan(&id, &created); err != nil {
			return nil, err
		}
		threadIDs = append(threadIDs, id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	threads := make([]model.Thread, 0, len(threadIDs))
	for _, tid := range threadIDs {
		t, err := s.buildThread(ctx, tid)
		if err != nil {
			return nil, err
		}
		threads = append(threads, *t)
	}
	return threads, nil
}

// GetThread returns a single thread with all messages.
func (s *Store) GetThread(ctx context.Context, threadID string) (*model.Thread, error) {
	return s.buildThread(ctx, threadID)
}

// CreateThread creates a new thread in the mailbox and returns its ID.
func (s *Store) CreateThread(ctx context.Context, mailboxID string) (string, error) {
	var id string
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_threads (mailbox_id) VALUES ($1) RETURNING id`,
		mailboxID,
	).Scan(&id)
	return id, err
}

// FindThreadBySubject tries to find an existing thread for threading
// by matching subject (stripped of Re:/Fwd: prefixes).
func (s *Store) FindThreadBySubject(ctx context.Context, mailboxID, subject string) (string, error) {
	clean := cleanSubject(subject)
	var id string
	err := s.DB.QueryRow(ctx,
		`SELECT t.id FROM mail_threads t
		 JOIN mail_messages m ON m.thread_id = t.id
		 WHERE t.mailbox_id = $1 AND m.subject ILIKE $2
		 ORDER BY t.created_at DESC LIMIT 1`,
		mailboxID, clean,
	).Scan(&id)
	return id, err
}

// buildThread assembles a Thread from its messages.
func (s *Store) buildThread(ctx context.Context, threadID string) (*model.Thread, error) {
	msgs, err := s.GetMessagesByThread(ctx, threadID)
	if err != nil {
		return nil, err
	}
	if len(msgs) == 0 {
		return nil, ErrNotFound
	}

	last := msgs[len(msgs)-1]
	unread := 0
	hasAtt := false
	labelSet := map[string]bool{}
	for _, m := range msgs {
		if !m.Read {
			unread++
		}
		if len(m.Attachments) > 0 {
			hasAtt = true
		}
		for _, l := range m.Labels {
			labelSet[l] = true
		}
	}

	labels := make([]string, 0, len(labelSet))
	for l := range labelSet {
		labels = append(labels, l)
	}

	snippet := last.BodyText
	if len(snippet) > 200 {
		snippet = snippet[:200] + "..."
	}

	return &model.Thread{
		ID:              threadID,
		Subject:         last.Subject,
		Messages:        msgs,
		LastMessageDate: last.Date,
		UnreadCount:     unread,
		Labels:          labels,
		Snippet:         snippet,
		From:            last.From,
		HasAttachments:  hasAtt,
	}, nil
}

// cleanSubject strips Re:/Fwd: prefixes for thread matching.
func cleanSubject(s string) string {
	for {
		lower := toLower(s)
		if len(lower) > 3 && (lower[:3] == "re:" || lower[:3] == "fw:") {
			s = trimLeft(s[3:])
		} else if len(lower) > 4 && lower[:4] == "fwd:" {
			s = trimLeft(s[4:])
		} else {
			break
		}
	}
	return s
}

func toLower(s string) string {
	b := make([]byte, len(s))
	for i := range s {
		c := s[i]
		if c >= 'A' && c <= 'Z' {
			b[i] = c + 32
		} else {
			b[i] = c
		}
	}
	return string(b)
}

func trimLeft(s string) string {
	i := 0
	for i < len(s) && (s[i] == ' ' || s[i] == '\t') {
		i++
	}
	return s[i:]
}
