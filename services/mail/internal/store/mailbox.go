package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// EnsureMailbox creates a mailbox for the user if it doesn't exist, and returns it.
func (s *Store) EnsureMailbox(ctx context.Context, userID string) (*model.Mailbox, error) {
	mb := &model.Mailbox{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mailboxes (user_id) VALUES ($1)
		 ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
		 RETURNING id, user_id, created_at`,
		userID,
	).Scan(&mb.ID, &mb.UserID, &mb.CreatedAt)
	if err != nil {
		return nil, err
	}
	return mb, nil
}

// GetMailboxByUser returns the mailbox for a user.
func (s *Store) GetMailboxByUser(ctx context.Context, userID string) (*model.Mailbox, error) {
	mb := &model.Mailbox{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, user_id, created_at FROM mailboxes WHERE user_id = $1`,
		userID,
	).Scan(&mb.ID, &mb.UserID, &mb.CreatedAt)
	if err != nil {
		return nil, err
	}
	return mb, nil
}

// SystemLabelNames defines the default system labels created per mailbox.
var SystemLabelNames = []struct {
	Name  string
	Color string
}{
	{"Inbox", ""},
	{"Starred", ""},
	{"Sent", ""},
	{"Drafts", ""},
	{"Archive", ""},
	{"Spam", ""},
	{"Trash", ""},
}

// EnsureSystemLabels creates the default system labels for a mailbox.
func (s *Store) EnsureSystemLabels(ctx context.Context, mailboxID string) error {
	for _, sl := range SystemLabelNames {
		_, err := s.DB.Exec(ctx,
			`INSERT INTO mail_labels (mailbox_id, name, color, is_system)
			 VALUES ($1, $2, $3, TRUE)
			 ON CONFLICT DO NOTHING`,
			mailboxID, sl.Name, sl.Color,
		)
		if err != nil {
			return err
		}
	}
	return nil
}
