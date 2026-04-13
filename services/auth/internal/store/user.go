package store

import (
	"context"
	"errors"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/jackc/pgx/v5"
)

func scanUser(row pgx.Row) (*model.User, error) {
	u := &model.User{}
	var emailVerified, suspended *time.Time
	err := row.Scan(
		&u.ID, &u.Email, &u.DisplayName, &u.PasswordHash, &u.AvatarURL,
		&emailVerified, &suspended, &u.MFAEnforced,
		&u.IsAdmin, &u.IsSuperAdmin, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	u.EmailVerifiedAt = emailVerified
	u.SuspendedAt = suspended
	return u, nil
}

const userSelect = `SELECT id, email, display_name, password_hash, COALESCE(avatar_url,''),
		email_verified_at, suspended_at, mfa_enforced, is_admin, is_super_admin, created_at, updated_at
		FROM users`

// CreateUserWithPassword registers a new user (password hash must be pre-computed).
func (s *Store) CreateUserWithPassword(ctx context.Context, email, displayName, passwordHash string) (*model.User, error) {
	var emailVerified, suspended *time.Time
	u := &model.User{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO users (email, display_name, password_hash)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, display_name, password_hash, COALESCE(avatar_url,''),
		           email_verified_at, suspended_at, mfa_enforced, is_admin, is_super_admin, created_at, updated_at`,
		email, displayName, passwordHash,
	).Scan(
		&u.ID, &u.Email, &u.DisplayName, &u.PasswordHash, &u.AvatarURL,
		&emailVerified, &suspended, &u.MFAEnforced,
		&u.IsAdmin, &u.IsSuperAdmin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	u.EmailVerifiedAt = emailVerified
	u.SuspendedAt = suspended
	return u, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	return scanUser(s.DB.QueryRow(ctx, userSelect+` WHERE lower(email) = lower($1)`, email))
}

func (s *Store) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	return scanUser(s.DB.QueryRow(ctx, userSelect+` WHERE id = $1`, id))
}

func (s *Store) UpdateUserEmail(ctx context.Context, id, email string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET email = $1, updated_at = $2 WHERE id = $3`,
		email, time.Now(), id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) UpdateUserDisplayName(ctx context.Context, id, displayName string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET display_name = $1, updated_at = $2 WHERE id = $3`,
		displayName, time.Now(), id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) UpdateUserAvatar(ctx context.Context, id, avatarURL string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET avatar_url = $1, updated_at = $2 WHERE id = $3`,
		avatarURL, time.Now(), id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) UpdatePasswordHash(ctx context.Context, id, hash string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3`,
		hash, time.Now(), id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) SetEmailVerified(ctx context.Context, id string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET email_verified_at = NOW(), updated_at = NOW() WHERE id = $1`,
		id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) SetSuspended(ctx context.Context, id string, suspended bool) error {
	var err error
	if suspended {
		_, err = s.DB.Exec(ctx, `UPDATE users SET suspended_at = NOW(), updated_at = NOW() WHERE id = $1`, id)
	} else {
		_, err = s.DB.Exec(ctx, `UPDATE users SET suspended_at = NULL, updated_at = NOW() WHERE id = $1`, id)
	}
	return err
}

func (s *Store) SetMFAEnforced(ctx context.Context, id string, enforced bool) error {
	_, err := s.DB.Exec(ctx, `UPDATE users SET mfa_enforced = $2, updated_at = NOW() WHERE id = $1`, id, enforced)
	return err
}

func (s *Store) DeleteUser(ctx context.Context, id string) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
