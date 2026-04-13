package store

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/jackc/pgx/v5"
)

const adminUserSelect = `SELECT u.id, u.email, u.display_name, u.password_hash, COALESCE(u.avatar_url,''),
		u.email_verified_at, u.suspended_at, u.mfa_enforced, u.is_admin, u.is_super_admin, u.created_at, u.updated_at,
		COALESCE((SELECT enabled FROM mfa_secrets m WHERE m.user_id = u.id LIMIT 1), false),
		(SELECT COUNT(*)::int FROM sessions s WHERE s.user_id = u.id AND s.expires_at > NOW()),
		COALESCE(q.mail_quota_bytes, 0)::bigint,
		COALESCE(q.drive_quota_bytes, 0)::bigint
		FROM users u
		LEFT JOIN storage_quotas q ON q.user_id = u.id`

func (s *Store) AdminListUsers(ctx context.Context, q string, limit, offset int) ([]model.AdminUserRow, int, error) {
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	q = strings.TrimSpace(strings.ToLower(q))
	var total int
	var err error
	if q != "" {
		pat := "%" + q + "%"
		err = s.DB.QueryRow(ctx,
			`SELECT COUNT(*) FROM users WHERE lower(email) LIKE $1 OR lower(display_name) LIKE $1`,
			pat,
		).Scan(&total)
	} else {
		err = s.DB.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&total)
	}
	if err != nil {
		return nil, 0, err
	}

	var rows pgx.Rows
	if q != "" {
		pat := "%" + q + "%"
		rows, err = s.DB.Query(ctx,
			adminUserSelect+` WHERE lower(u.email) LIKE $1 OR lower(u.display_name) LIKE $1
			ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
			pat, limit, offset,
		)
	} else {
		rows, err = s.DB.Query(ctx,
			adminUserSelect+` ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
			limit, offset,
		)
	}
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var rowsOut []model.AdminUserRow
	for rows.Next() {
		var r model.AdminUserRow
		var emailVerified, suspended *time.Time
		if err := rows.Scan(
			&r.ID, &r.Email, &r.DisplayName, &r.PasswordHash, &r.AvatarURL,
			&emailVerified, &suspended, &r.MFAEnforced, &r.IsAdmin, &r.IsSuperAdmin, &r.CreatedAt, &r.UpdatedAt,
			&r.MFAEnabled, &r.SessionCount, &r.MailQuotaBytes, &r.DriveQuotaBytes,
		); err != nil {
			return nil, 0, err
		}
		r.EmailVerifiedAt = emailVerified
		r.SuspendedAt = suspended
		r.EmailVerified = emailVerified != nil
		rowsOut = append(rowsOut, r)
	}
	return rowsOut, total, rows.Err()
}

func (s *Store) AdminGetUser(ctx context.Context, id string) (*model.AdminUserRow, error) {
	var r model.AdminUserRow
	var emailVerified, suspended *time.Time
	err := s.DB.QueryRow(ctx,
		adminUserSelect+` WHERE u.id = $1`,
		id,
	).Scan(
		&r.ID, &r.Email, &r.DisplayName, &r.PasswordHash, &r.AvatarURL,
		&emailVerified, &suspended, &r.MFAEnforced, &r.IsAdmin, &r.IsSuperAdmin, &r.CreatedAt, &r.UpdatedAt,
		&r.MFAEnabled, &r.SessionCount, &r.MailQuotaBytes, &r.DriveQuotaBytes,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	r.EmailVerifiedAt = emailVerified
	r.SuspendedAt = suspended
	r.EmailVerified = emailVerified != nil
	return &r, nil
}

func (s *Store) AdminQueueStats(ctx context.Context) (queued, sending, sent, deferred, failed int64, err error) {
	err = s.DB.QueryRow(ctx,
		`SELECT
			COUNT(*) FILTER (WHERE status IN ('queued'))::bigint,
			COUNT(*) FILTER (WHERE status = 'sending')::bigint,
			COUNT(*) FILTER (WHERE status = 'sent')::bigint,
			COUNT(*) FILTER (WHERE status = 'deferred')::bigint,
			COUNT(*) FILTER (WHERE status = 'failed')::bigint
		 FROM outbound_queue`,
	).Scan(&queued, &sending, &sent, &deferred, &failed)
	return
}

func (s *Store) AdminAttachmentStats(ctx context.Context) (count int64, totalBytes int64, err error) {
	err = s.DB.QueryRow(ctx,
		`SELECT COUNT(*)::bigint, COALESCE(SUM(size), 0)::bigint FROM mail_attachments`,
	).Scan(&count, &totalBytes)
	return
}

func (s *Store) AdminListDomains(ctx context.Context, limit int) ([]AdminDomainRow, error) {
	if limit <= 0 || limit > 200 {
		limit = 100
	}
	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, domain, status, mx_verified, spf_verified, dkim_verified, dmarc_verified,
			last_checked_at, verified_at, created_at
		 FROM custom_domains ORDER BY updated_at DESC LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []AdminDomainRow
	for rows.Next() {
		var d AdminDomainRow
		if err := rows.Scan(&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified, &d.DKIMVerified, &d.DMARCVerified,
			&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

func (s *Store) AdminOverrideDomainVerify(ctx context.Context, domainID string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE custom_domains SET status = 'verified', mx_verified = true, spf_verified = true,
			dkim_verified = true, dmarc_verified = true, verified_at = NOW(), updated_at = NOW()
		 WHERE id = $1`,
		domainID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) AdminPoolStats(ctx context.Context) (acquired, idle, max int32, err error) {
	st := s.DB.Stat()
	return int32(st.AcquiredConns()), int32(st.IdleConns()), int32(st.MaxConns()), nil
}
