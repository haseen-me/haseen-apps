package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/jackc/pgx/v5"
)

const sessionDuration = 30 * 24 * time.Hour // 30 days

// CreateSession generates a random token, stores its SHA-256 hash, and returns the raw token.
func (s *Store) CreateSession(ctx context.Context, userID, userAgent, ipAddress string) (string, error) {
	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	token := hex.EncodeToString(raw)
	hash := hashToken(token)
	expiresAt := time.Now().Add(sessionDuration)

	_, err := s.DB.Exec(ctx,
		`INSERT INTO sessions (user_id, token_hash, user_agent, ip_address, expires_at)
		 VALUES ($1, $2, $3, $4::inet, $5)`,
		userID, hash, userAgent, ipAddress, expiresAt,
	)
	if err != nil {
		return "", err
	}
	return token, nil
}

// ValidateSession checks a raw token and returns the session if valid.
func (s *Store) ValidateSession(ctx context.Context, token string) (*model.Session, error) {
	hash := hashToken(token)
	sess := &model.Session{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, user_id, token_hash, user_agent, COALESCE(ip_address::text, ''), expires_at, created_at
		 FROM sessions
		 WHERE token_hash = $1 AND expires_at > $2`,
		hash, time.Now(),
	).Scan(&sess.ID, &sess.UserID, &sess.TokenHash, &sess.UserAgent, &sess.IPAddress, &sess.ExpiresAt, &sess.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return sess, err
}

// DeleteSession removes a single session by token.
func (s *Store) DeleteSession(ctx context.Context, token string) error {
	hash := hashToken(token)
	_, err := s.DB.Exec(ctx, `DELETE FROM sessions WHERE token_hash = $1`, hash)
	return err
}

// DeleteUserSessions removes all sessions for a user.
func (s *Store) DeleteUserSessions(ctx context.Context, userID string) error {
	_, err := s.DB.Exec(ctx, `DELETE FROM sessions WHERE user_id = $1`, userID)
	return err
}

// RefreshSession extends the expiry of the given session token.
func (s *Store) RefreshSession(ctx context.Context, token string) error {
	hash := hashToken(token)
	expiresAt := time.Now().Add(sessionDuration)
	tag, err := s.DB.Exec(ctx,
		`UPDATE sessions SET expires_at = $1 WHERE token_hash = $2 AND expires_at > $3`,
		expiresAt, hash, time.Now(),
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// CleanExpiredSessions removes all expired sessions.
func (s *Store) CleanExpiredSessions(ctx context.Context) (int64, error) {
	tag, err := s.DB.Exec(ctx, `DELETE FROM sessions WHERE expires_at < $1`, time.Now())
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}

// ListUserSessions returns all active sessions for a user.
func (s *Store) ListUserSessions(ctx context.Context, userID string) ([]model.Session, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, token_hash, user_agent, COALESCE(ip_address::text, ''), expires_at, created_at
		 FROM sessions
		 WHERE user_id = $1 AND expires_at > $2
		 ORDER BY created_at DESC`,
		userID, time.Now(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []model.Session
	for rows.Next() {
		var s model.Session
		if err := rows.Scan(&s.ID, &s.UserID, &s.TokenHash, &s.UserAgent, &s.IPAddress, &s.ExpiresAt, &s.CreatedAt); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	return sessions, rows.Err()
}

// RevokeSession deletes a specific session by ID, verifying it belongs to the user.
func (s *Store) RevokeSession(ctx context.Context, sessionID, userID string) error {
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM sessions WHERE id = $1 AND user_id = $2`,
		sessionID, userID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func hashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}
