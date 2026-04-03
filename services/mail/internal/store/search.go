package store

import (
	"context"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// Search performs full-text search across messages in a mailbox.
func (s *Store) Search(ctx context.Context, mailboxID, query string) ([]model.Thread, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT DISTINCT m.thread_id
		 FROM mail_messages m
		 WHERE m.mailbox_id = $1
		   AND m.search_vector @@ plainto_tsquery('english', $2)
		 ORDER BY m.thread_id
		 LIMIT 50`,
		mailboxID, query,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threadIDs []string
	for rows.Next() {
		var tid string
		if err := rows.Scan(&tid); err != nil {
			return nil, err
		}
		threadIDs = append(threadIDs, tid)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	threads := make([]model.Thread, 0, len(threadIDs))
	for _, tid := range threadIDs {
		t, err := s.buildThread(ctx, tid)
		if err != nil {
			continue // skip threads with errors
		}
		threads = append(threads, *t)
	}
	return threads, nil
}

// SearchByAddress searches messages by sender or recipient address.
// Fallback when full-text search returns no results.
func (s *Store) SearchByAddress(ctx context.Context, mailboxID, query string) ([]model.Thread, error) {
	pattern := "%" + query + "%"
	rows, err := s.DB.Query(ctx,
		`SELECT DISTINCT m.thread_id
		 FROM mail_messages m
		 WHERE m.mailbox_id = $1
		   AND (m.from_address ILIKE $2
		     OR EXISTS (SELECT 1 FROM unnest(m.to_addresses) a WHERE a ILIKE $2)
		     OR m.subject ILIKE $2)
		 ORDER BY m.thread_id
		 LIMIT 50`,
		mailboxID, pattern,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threadIDs []string
	for rows.Next() {
		var tid string
		if err := rows.Scan(&tid); err != nil {
			return nil, err
		}
		threadIDs = append(threadIDs, tid)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	threads := make([]model.Thread, 0, len(threadIDs))
	for _, tid := range threadIDs {
		t, err := s.buildThread(ctx, tid)
		if err != nil {
			continue
		}
		threads = append(threads, *t)
	}
	return threads, nil
}

// CountByLabel counts messages in a specific label for a mailbox.
func (s *Store) CountByLabel(ctx context.Context, mailboxID, labelID string) (int, error) {
	var count int
	err := s.DB.QueryRow(ctx,
		`SELECT COUNT(DISTINCT thread_id)
		 FROM mail_messages
		 WHERE mailbox_id = $1 AND label_id = $2`,
		mailboxID, labelID,
	).Scan(&count)
	return count, err
}

// GetUserByEmail finds a user ID by email address.
func (s *Store) GetUserByEmail(ctx context.Context, email string) (string, error) {
	var userID string
	err := s.DB.QueryRow(ctx,
		`SELECT id FROM users WHERE email = $1`,
		email,
	).Scan(&userID)
	return userID, err
}

// GetUserEmail returns the email address for a user.
func (s *Store) GetUserEmail(ctx context.Context, userID string) (string, error) {
	var email string
	err := s.DB.QueryRow(ctx,
		`SELECT email FROM users WHERE id = $1`,
		userID,
	).Scan(&email)
	return email, err
}

// Unused import guard
var _ = time.Now
