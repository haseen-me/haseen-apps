package store

import (
	"context"
	"errors"

	"github.com/haseen-me/haseen-apps/services/keyserver/internal/model"
	"github.com/jackc/pgx/v5"
)

// UploadPreKeys stores a batch of signed pre-keys for a user.
func (s *Store) UploadPreKeys(ctx context.Context, userID string, keys []model.PreKeyUpload) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, k := range keys {
		_, err := tx.Exec(ctx,
			`INSERT INTO signed_pre_keys (user_id, key_id, public_key, signature)
			 VALUES ($1, $2, $3, $4)
			 ON CONFLICT (user_id, key_id) DO UPDATE SET
				public_key = EXCLUDED.public_key,
				signature = EXCLUDED.signature,
				is_used = FALSE`,
			userID, k.KeyID, k.PublicKey, k.Signature,
		)
		if err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}

// ClaimPreKey returns one unused pre-key for a user and marks it as used.
func (s *Store) ClaimPreKey(ctx context.Context, userID string) (*model.SignedPreKey, error) {
	pk := &model.SignedPreKey{}
	err := s.DB.QueryRow(ctx,
		`UPDATE signed_pre_keys
		 SET is_used = TRUE
		 WHERE id = (
			SELECT id FROM signed_pre_keys
			WHERE user_id = $1 AND is_used = FALSE
			ORDER BY key_id ASC
			LIMIT 1
		 )
		 RETURNING id, user_id, key_id, public_key, signature, is_used, created_at`,
		userID,
	).Scan(&pk.ID, &pk.UserID, &pk.KeyID, &pk.PublicKey, &pk.Signature, &pk.IsUsed, &pk.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return pk, err
}

// CountAvailablePreKeys returns the number of unused pre-keys for a user.
func (s *Store) CountAvailablePreKeys(ctx context.Context, userID string) (int, error) {
	var count int
	err := s.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM signed_pre_keys WHERE user_id = $1 AND is_used = FALSE`,
		userID,
	).Scan(&count)
	return count, err
}
