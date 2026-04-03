package store

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

func (s *Store) GetMFASecret(ctx context.Context, userID string) (string, bool, error) {
	var secret string
	var enabled bool
	err := s.DB.QueryRow(ctx,
		`SELECT secret, enabled FROM mfa_secrets WHERE user_id = $1`,
		userID,
	).Scan(&secret, &enabled)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", false, nil
	}
	return secret, enabled, err
}

func (s *Store) UpsertMFASecret(ctx context.Context, userID, secret string) error {
	_, err := s.DB.Exec(ctx,
		`INSERT INTO mfa_secrets (user_id, secret, enabled)
		 VALUES ($1, $2, FALSE)
		 ON CONFLICT (user_id) DO UPDATE SET secret = $2, enabled = FALSE`,
		userID, secret,
	)
	return err
}

func (s *Store) EnableMFA(ctx context.Context, userID string) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE mfa_secrets SET enabled = TRUE WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DisableMFA(ctx context.Context, userID string) error {
	_, err := s.DB.Exec(ctx, `DELETE FROM mfa_secrets WHERE user_id = $1`, userID)
	return err
}

func (s *Store) IsMFAEnabled(ctx context.Context, userID string) (bool, error) {
	var enabled bool
	err := s.DB.QueryRow(ctx,
		`SELECT enabled FROM mfa_secrets WHERE user_id = $1`,
		userID,
	).Scan(&enabled)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil
	}
	return enabled, err
}

// --- Recovery Keys ---

func (s *Store) StoreRecoveryKey(ctx context.Context, userID string, encryptedKey []byte, keyHash string) error {
	// Delete old recovery keys first
	_, _ = s.DB.Exec(ctx, `DELETE FROM recovery_keys WHERE user_id = $1`, userID)
	_, err := s.DB.Exec(ctx,
		`INSERT INTO recovery_keys (user_id, encrypted_key, key_hash) VALUES ($1, $2, $3)`,
		userID, encryptedKey, keyHash,
	)
	return err
}

func (s *Store) HasRecoveryKey(ctx context.Context, userID string) (bool, error) {
	var count int
	err := s.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM recovery_keys WHERE user_id = $1`,
		userID,
	).Scan(&count)
	return count > 0, err
}

func (s *Store) ValidateRecoveryKey(ctx context.Context, userID, rawKey string) (bool, error) {
	h := sha256.Sum256([]byte(rawKey))
	keyHash := hex.EncodeToString(h[:])
	var count int
	err := s.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM recovery_keys WHERE user_id = $1 AND key_hash = $2`,
		userID, keyHash,
	).Scan(&count)
	return count > 0, err
}

// GenerateRecoveryKey creates a formatted recovery key (XXXX-XXXX-...) and returns {raw, hash, encrypted_placeholder}.
func GenerateRecoveryKey() (raw string, keyHash string, err error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	hexStr := strings.ToUpper(hex.EncodeToString(b))
	var parts []string
	for i := 0; i < len(hexStr); i += 4 {
		end := i + 4
		if end > len(hexStr) {
			end = len(hexStr)
		}
		parts = append(parts, hexStr[i:end])
	}
	raw = fmt.Sprintf("HSNR-%s", strings.Join(parts, "-"))
	h := sha256.Sum256([]byte(raw))
	keyHash = hex.EncodeToString(h[:])
	return raw, keyHash, nil
}
