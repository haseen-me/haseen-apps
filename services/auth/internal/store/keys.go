package store

import (
	"context"
	"errors"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) StorePublicKeys(ctx context.Context, userID string, encKey, signKey, sig []byte) (*model.PublicKeyBundle, error) {
	b := &model.PublicKeyBundle{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO public_key_bundles (user_id, encryption_public_key, signing_public_key, self_signature)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, user_id, encryption_public_key, signing_public_key, self_signature, is_active, created_at, revoked_at`,
		userID, encKey, signKey, sig,
	).Scan(&b.ID, &b.UserID, &b.EncryptionPublicKey, &b.SigningPublicKey, &b.SelfSignature, &b.IsActive, &b.CreatedAt, &b.RevokedAt)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (s *Store) GetActivePublicKeys(ctx context.Context, userID string) (*model.PublicKeyBundle, error) {
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

func (s *Store) RevokePublicKeys(ctx context.Context, userID string) error {
	_, err := s.DB.Exec(ctx,
		`UPDATE public_key_bundles SET is_active = FALSE, revoked_at = NOW() WHERE user_id = $1 AND is_active = TRUE`,
		userID,
	)
	return err
}
