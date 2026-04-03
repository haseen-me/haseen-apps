package store

import (
	"context"
	"errors"

	"github.com/haseen-me/haseen-apps/services/keyserver/internal/model"
	"github.com/jackc/pgx/v5"
)

// GetActiveKeys returns the active public key bundle for a user.
func (s *Store) GetActiveKeys(ctx context.Context, userID string) (*model.PublicKeyBundle, error) {
	b := &model.PublicKeyBundle{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, user_id, encryption_public_key, signing_public_key, self_signature, is_active, created_at, revoked_at
		 FROM public_key_bundles
		 WHERE user_id = $1 AND is_active = TRUE
		 ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&b.ID, &b.UserID, &b.EncryptionPublicKey, &b.SigningPublicKey, &b.SelfSignature, &b.IsActive, &b.CreatedAt, &b.RevokedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return b, err
}

// GetSigningKey returns just the signing public key for a user.
func (s *Store) GetSigningKey(ctx context.Context, userID string) ([]byte, error) {
	var key []byte
	err := s.DB.QueryRow(ctx,
		`SELECT signing_public_key FROM public_key_bundles
		 WHERE user_id = $1 AND is_active = TRUE
		 ORDER BY created_at DESC LIMIT 1`,
		userID,
	).Scan(&key)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrNotFound
	}
	return key, err
}

// BatchLookup returns active keys for multiple users.
func (s *Store) BatchLookup(ctx context.Context, userIDs []string) (map[string]*model.PublicKeyBundle, error) {
	result := make(map[string]*model.PublicKeyBundle, len(userIDs))

	rows, err := s.DB.Query(ctx,
		`SELECT DISTINCT ON (user_id)
			id, user_id, encryption_public_key, signing_public_key, self_signature, is_active, created_at, revoked_at
		 FROM public_key_bundles
		 WHERE user_id = ANY($1) AND is_active = TRUE
		 ORDER BY user_id, created_at DESC`,
		userIDs,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		b := &model.PublicKeyBundle{}
		if err := rows.Scan(&b.ID, &b.UserID, &b.EncryptionPublicKey, &b.SigningPublicKey, &b.SelfSignature, &b.IsActive, &b.CreatedAt, &b.RevokedAt); err != nil {
			return nil, err
		}
		result[b.UserID] = b
	}
	return result, rows.Err()
}

// PublishKeys stores a new public key bundle for a user.
func (s *Store) PublishKeys(ctx context.Context, userID string, encKey, signKey, sig []byte) (*model.PublicKeyBundle, error) {
	b := &model.PublicKeyBundle{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO public_key_bundles (user_id, encryption_public_key, signing_public_key, self_signature)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, user_id, encryption_public_key, signing_public_key, self_signature, is_active, created_at, revoked_at`,
		userID, encKey, signKey, sig,
	).Scan(&b.ID, &b.UserID, &b.EncryptionPublicKey, &b.SigningPublicKey, &b.SelfSignature, &b.IsActive, &b.CreatedAt, &b.RevokedAt)
	return b, err
}

// RevokeKeys marks all active key bundles as revoked for a user.
func (s *Store) RevokeKeys(ctx context.Context, userID string) error {
	_, err := s.DB.Exec(ctx,
		`UPDATE public_key_bundles SET is_active = FALSE, revoked_at = NOW()
		 WHERE user_id = $1 AND is_active = TRUE`,
		userID,
	)
	return err
}

// RotateKeys revokes old keys and publishes new ones atomically.
func (s *Store) RotateKeys(ctx context.Context, userID string, encKey, signKey, sig []byte) (*model.PublicKeyBundle, error) {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	// Revoke old
	_, err = tx.Exec(ctx,
		`UPDATE public_key_bundles SET is_active = FALSE, revoked_at = NOW()
		 WHERE user_id = $1 AND is_active = TRUE`,
		userID,
	)
	if err != nil {
		return nil, err
	}

	// Insert new
	b := &model.PublicKeyBundle{}
	err = tx.QueryRow(ctx,
		`INSERT INTO public_key_bundles (user_id, encryption_public_key, signing_public_key, self_signature)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, user_id, encryption_public_key, signing_public_key, self_signature, is_active, created_at, revoked_at`,
		userID, encKey, signKey, sig,
	).Scan(&b.ID, &b.UserID, &b.EncryptionPublicKey, &b.SigningPublicKey, &b.SelfSignature, &b.IsActive, &b.CreatedAt, &b.RevokedAt)
	if err != nil {
		return nil, err
	}

	return b, tx.Commit(ctx)
}
