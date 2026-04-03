package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// GetLabels returns all labels for a mailbox.
func (s *Store) GetLabels(ctx context.Context, mailboxID string) ([]model.Label, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, mailbox_id, name, COALESCE(color, ''), is_system
		 FROM mail_labels WHERE mailbox_id = $1
		 ORDER BY is_system DESC, name ASC`,
		mailboxID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var labels []model.Label
	for rows.Next() {
		var l model.Label
		if err := rows.Scan(&l.ID, &l.MailboxID, &l.Name, &l.Color, &l.IsSystem); err != nil {
			return nil, err
		}
		labels = append(labels, l)
	}
	return labels, rows.Err()
}

// GetLabelByID returns a single label.
func (s *Store) GetLabelByID(ctx context.Context, labelID string) (*model.Label, error) {
	l := &model.Label{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, mailbox_id, name, COALESCE(color, ''), is_system
		 FROM mail_labels WHERE id = $1`,
		labelID,
	).Scan(&l.ID, &l.MailboxID, &l.Name, &l.Color, &l.IsSystem)
	if err != nil {
		return nil, err
	}
	return l, nil
}

// GetLabelByName returns a label by name within a mailbox.
func (s *Store) GetLabelByName(ctx context.Context, mailboxID, name string) (*model.Label, error) {
	l := &model.Label{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, mailbox_id, name, COALESCE(color, ''), is_system
		 FROM mail_labels WHERE mailbox_id = $1 AND LOWER(name) = LOWER($2)`,
		mailboxID, name,
	).Scan(&l.ID, &l.MailboxID, &l.Name, &l.Color, &l.IsSystem)
	if err != nil {
		return nil, err
	}
	return l, nil
}

// CreateLabel creates a new user label.
func (s *Store) CreateLabel(ctx context.Context, mailboxID, name, color string) (*model.Label, error) {
	l := &model.Label{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_labels (mailbox_id, name, color, is_system)
		 VALUES ($1, $2, $3, FALSE)
		 RETURNING id, mailbox_id, name, COALESCE(color, ''), is_system`,
		mailboxID, name, color,
	).Scan(&l.ID, &l.MailboxID, &l.Name, &l.Color, &l.IsSystem)
	if err != nil {
		return nil, err
	}
	return l, nil
}

// UpdateLabel updates a user label's name and/or color.
func (s *Store) UpdateLabel(ctx context.Context, labelID string, name *string, color *string) (*model.Label, error) {
	l := &model.Label{}
	err := s.DB.QueryRow(ctx,
		`UPDATE mail_labels SET
		   name  = COALESCE($2, name),
		   color = COALESCE($3, color)
		 WHERE id = $1 AND is_system = FALSE
		 RETURNING id, mailbox_id, name, COALESCE(color, ''), is_system`,
		labelID, name, color,
	).Scan(&l.ID, &l.MailboxID, &l.Name, &l.Color, &l.IsSystem)
	if err != nil {
		return nil, err
	}
	return l, nil
}

// DeleteLabel deletes a user label (not system labels).
func (s *Store) DeleteLabel(ctx context.Context, labelID string) error {
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM mail_labels WHERE id = $1 AND is_system = FALSE`,
		labelID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
