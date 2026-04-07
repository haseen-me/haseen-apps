package store

import (
	"context"
	"errors"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) CreateUser(ctx context.Context, email, srpSalt, srpVerifier string) (*model.User, error) {
	u := &model.User{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO users (email, srp_salt, srp_verifier)
		 VALUES ($1, $2, $3)
		 RETURNING id, email, display_name, srp_salt, srp_verifier, created_at, updated_at`,
		email, srpSalt, srpVerifier,
	).Scan(&u.ID, &u.Email, &u.DisplayName, &u.SRPSalt, &u.SRPVerifier, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (s *Store) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	u := &model.User{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, email, display_name, srp_salt, srp_verifier, created_at, updated_at
		 FROM users WHERE email = $1`,
		email,
	).Scan(&u.ID, &u.Email, &u.DisplayName, &u.SRPSalt, &u.SRPVerifier, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
}

func (s *Store) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	u := &model.User{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, email, display_name, srp_salt, srp_verifier, created_at, updated_at
		 FROM users WHERE id = $1`,
		id,
	).Scan(&u.ID, &u.Email, &u.DisplayName, &u.SRPSalt, &u.SRPVerifier, &u.CreatedAt, &u.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return u, err
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

func (s *Store) UpdateUserSRP(ctx context.Context, id, srpSalt, srpVerifier string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE users SET srp_salt = $1, srp_verifier = $2, updated_at = $3 WHERE id = $4`,
		srpSalt, srpVerifier, time.Now(), id,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
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
