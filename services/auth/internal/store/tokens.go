package store

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

func HashOpaqueToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

func hashOpaqueToken(token string) string {
	return HashOpaqueToken(token)
}

// CreateEmailVerificationToken stores a hashed verification token.
func (s *Store) CreateEmailVerificationToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error {
	_, err := s.DB.Exec(ctx,
		`DELETE FROM email_verification_tokens WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		return err
	}
	_, err = s.DB.Exec(ctx,
		`INSERT INTO email_verification_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

// ConsumeEmailVerificationToken validates token and returns user id.
func (s *Store) ConsumeEmailVerificationToken(ctx context.Context, token string) (string, error) {
	h := hashOpaqueToken(token)
	var uid string
	err := s.DB.QueryRow(ctx,
		`DELETE FROM email_verification_tokens
		 WHERE token_hash = $1 AND expires_at > NOW()
		 RETURNING user_id`,
		h,
	).Scan(&uid)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return uid, err
}

func (s *Store) CreatePasswordResetToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error {
	_, err := s.DB.Exec(ctx, `DELETE FROM password_reset_tokens WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}
	_, err = s.DB.Exec(ctx,
		`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

func (s *Store) ConsumePasswordResetToken(ctx context.Context, token string) (string, error) {
	h := hashOpaqueToken(token)
	var uid string
	err := s.DB.QueryRow(ctx,
		`DELETE FROM password_reset_tokens
		 WHERE token_hash = $1 AND expires_at > NOW()
		 RETURNING user_id`,
		h,
	).Scan(&uid)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return uid, err
}

// CreateMFALoginChallenge stores a short-lived MFA step-up token after password verification.
func (s *Store) CreateMFALoginChallenge(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error {
	if _, err := s.DB.Exec(ctx, `DELETE FROM login_mfa_challenges WHERE user_id = $1`, userID); err != nil {
		return err
	}
	_, err := s.DB.Exec(ctx,
		`INSERT INTO login_mfa_challenges (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		userID, tokenHash, expiresAt,
	)
	return err
}

func (s *Store) ConsumeMFALoginChallenge(ctx context.Context, token string) (string, error) {
	h := hashOpaqueToken(token)
	var uid string
	err := s.DB.QueryRow(ctx,
		`DELETE FROM login_mfa_challenges
		 WHERE token_hash = $1 AND expires_at > NOW()
		 RETURNING user_id`,
		h,
	).Scan(&uid)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return uid, err
}
