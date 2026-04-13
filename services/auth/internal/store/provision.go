package store

import (
	"context"

	"github.com/jackc/pgx/v5"
)

// ProvisionUserResources creates the per-user rows required by other services.
// It is intentionally idempotent so it can be safely retried.
func (s *Store) ProvisionUserResources(ctx context.Context, userID string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// Mailbox
	var mailboxID string
	if err := tx.QueryRow(ctx,
		`INSERT INTO mailboxes (user_id) VALUES ($1)
		 ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
		 RETURNING id`,
		userID,
	).Scan(&mailboxID); err != nil {
		return err
	}

	// System labels (unique constraint added via migration 016)
	type lbl struct{ name, color string }
	system := []lbl{
		{"Inbox", ""},
		{"Starred", ""},
		{"Sent", ""},
		{"Drafts", ""},
		{"Archive", ""},
		{"Spam", ""},
		{"Trash", ""},
	}
	for _, l := range system {
		if _, err := tx.Exec(ctx,
			`INSERT INTO mail_labels (mailbox_id, name, color, is_system)
			 VALUES ($1, $2, $3, TRUE)
			 ON CONFLICT (mailbox_id, name) DO NOTHING`,
			mailboxID, l.name, l.color,
		); err != nil {
			return err
		}
	}

	// Drive: ensure a root folder exists (parent_id NULL).
	// The drive service treats NULL parent_id as root, so we create a single canonical row.
	var exists bool
	if err := tx.QueryRow(ctx,
		`SELECT EXISTS (
		   SELECT 1 FROM drive_folders WHERE owner_id = $1 AND parent_id IS NULL AND deleted_at IS NULL
		 )`,
		userID,
	).Scan(&exists); err == nil && !exists {
		if _, err := tx.Exec(ctx, `INSERT INTO drive_folders (owner_id, parent_id, name) VALUES ($1, NULL, $2)`, userID, "Root"); err != nil {
			return err
		}
	}

	// Quotas: create per-user quota rows if the schema supports it (optional table).
	// NOTE: enforcement is currently service-level for Drive; admin management uses this table.
	_, _ = tx.Exec(ctx,
		`INSERT INTO storage_quotas (user_id, mail_quota_bytes, drive_quota_bytes)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (user_id) DO NOTHING`,
		userID, DefaultMailQuotaBytes, DefaultDriveQuotaBytes,
	)

	if err := tx.Commit(ctx); err != nil && err != pgx.ErrTxClosed {
		return err
	}
	return nil
}

