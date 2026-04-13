package store

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// GetThreadsByLabel returns threads for a mailbox filtered by label name.
// It supports cursor-based pagination: cursor is a created_at timestamp,
// limit controls page size.
func (s *Store) GetThreadsByLabel(ctx context.Context, mailboxID, labelID string, limit int, cursor string) ([]model.Thread, string, bool, error) {
	if limit <= 0 || limit > 100 {
		limit = 25
	}

	// Fetch one extra to determine hasMore
	fetchLimit := limit + 1

	var query string
	var args []interface{}

	if cursor != "" {
		query = `SELECT DISTINCT t.id, t.created_at
		 FROM mail_threads t
		 JOIN mail_messages m ON m.thread_id = t.id
		 WHERE t.mailbox_id = $1 AND m.label_id = $2
		   AND t.created_at < TO_TIMESTAMP($3::double precision / 1000000.0)
		 ORDER BY t.created_at DESC
		 LIMIT $4`
		args = []interface{}{mailboxID, labelID, cursor, fetchLimit}
	} else {
		query = `SELECT DISTINCT t.id, t.created_at
		 FROM mail_threads t
		 JOIN mail_messages m ON m.thread_id = t.id
		 WHERE t.mailbox_id = $1 AND m.label_id = $2
		 ORDER BY t.created_at DESC
		 LIMIT $3`
		args = []interface{}{mailboxID, labelID, fetchLimit}
	}

	rows, err := s.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, "", false, err
	}
	defer rows.Close()

	type threadRow struct {
		id        string
		createdAt time.Time
	}
	var threadRows []threadRow
	for rows.Next() {
		var r threadRow
		if err := rows.Scan(&r.id, &r.createdAt); err != nil {
			return nil, "", false, err
		}
		threadRows = append(threadRows, r)
	}
	if err := rows.Err(); err != nil {
		return nil, "", false, err
	}

	hasMore := len(threadRows) > limit
	if hasMore {
		threadRows = threadRows[:limit]
	}

	threads := make([]model.Thread, 0, len(threadRows))
	for _, r := range threadRows {
		t, err := s.buildThread(ctx, r.id)
		if err != nil {
			return nil, "", false, err
		}
		threads = append(threads, *t)
	}

	var nextCursor string
	if hasMore && len(threadRows) > 0 {
		last := threadRows[len(threadRows)-1]
		nextCursor = fmt.Sprintf("%d", last.createdAt.UnixMicro())
	}

	return threads, nextCursor, hasMore, nil
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

func (s *Store) FindThreadByMessageHeaders(ctx context.Context, mailboxID, inReplyTo string, references []string) (string, error) {
	candidates := make([]string, 0, len(references)+1)
	if inReplyTo != "" {
		candidates = append(candidates, inReplyTo)
	}
	candidates = append(candidates, references...)
	if len(candidates) == 0 {
		return "", ErrNotFound
	}

	var id string
	err := s.DB.QueryRow(ctx,
		`SELECT t.id
		 FROM mail_threads t
		 JOIN mail_messages m ON m.thread_id = t.id
		 WHERE t.mailbox_id = $1
		   AND (m.message_id_header = ANY($2) OR m.in_reply_to_header = ANY($2))
		 ORDER BY t.updated_at DESC
		 LIMIT 1`,
		mailboxID, candidates,
	).Scan(&id)
	if err == pgx.ErrNoRows {
		return "", ErrNotFound
	}
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
