package store

import (
	"context"
	"encoding/base64"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
)

func (s *Store) ListWebAuthnCredentials(ctx context.Context, userID string) ([]model.WebAuthnCredential, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, name, created_at, last_used_at, sign_count, credential_id
		 FROM webauthn_credentials WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var list []model.WebAuthnCredential
	for rows.Next() {
		var c model.WebAuthnCredential
		var credID []byte
		if err := rows.Scan(&c.ID, &c.UserID, &c.Name, &c.CreatedAt, &c.LastUsedAt, &c.SignCount, &credID); err != nil {
			return nil, err
		}
		c.CredentialIDB64 = base64.RawURLEncoding.EncodeToString(credID)
		list = append(list, c)
	}
	return list, rows.Err()
}

func (s *Store) UpsertWebAuthnCredential(ctx context.Context, userID string, cred *webauthn.Credential, name string) error {
	pub := cred.PublicKey
	trans := make([]string, 0, len(cred.Transport))
	for _, t := range cred.Transport {
		trans = append(trans, string(t))
	}
	aaguid := cred.Authenticator.AAGUID
	if len(aaguid) == 0 {
		aaguid = make([]byte, 16)
	}
	_, err := s.DB.Exec(ctx,
		`INSERT INTO webauthn_credentials
		 (user_id, credential_id, public_key, attestation_type, transport, sign_count, aaguid, name, last_used_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		 ON CONFLICT (credential_id) DO UPDATE SET
		   public_key = EXCLUDED.public_key,
		   sign_count = EXCLUDED.sign_count,
		   transport = EXCLUDED.transport,
		   name = COALESCE(NULLIF(EXCLUDED.name, ''), webauthn_credentials.name),
		   last_used_at = NOW()`,
		userID, cred.ID, pub, cred.AttestationType, trans, cred.Authenticator.SignCount, aaguid, name,
	)
	return err
}

func (s *Store) UpdateWebAuthnSignCount(ctx context.Context, credID []byte, signCount uint32) error {
	tag, err := s.DB.Exec(ctx,
		`UPDATE webauthn_credentials SET sign_count = $2, last_used_at = NOW() WHERE credential_id = $1`,
		credID, signCount,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) DeleteWebAuthnCredential(ctx context.Context, userID, credIDB64 string) error {
	raw, err := base64.RawURLEncoding.DecodeString(credIDB64)
	if err != nil {
		return err
	}
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM webauthn_credentials WHERE user_id = $1 AND credential_id = $2`,
		userID, raw,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) WebAuthnCredentialsForUser(ctx context.Context, userID string) ([]webauthn.Credential, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT credential_id, public_key, COALESCE(attestation_type,''), transport, sign_count, aaguid
		 FROM webauthn_credentials WHERE user_id = $1`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []webauthn.Credential
	for rows.Next() {
		var c webauthn.Credential
		var pub []byte
		var att string
		var trans []string
		var sc int64
		var aaguid []byte
		if err := rows.Scan(&c.ID, &pub, &att, &trans, &sc, &aaguid); err != nil {
			return nil, err
		}
		c.PublicKey = pub
		c.AttestationType = att
		for _, t := range trans {
			c.Transport = append(c.Transport, protocol.AuthenticatorTransport(t))
		}
		c.Authenticator = webauthn.Authenticator{
			SignCount: uint32(sc),
			AAGUID:    aaguid,
		}
		out = append(out, c)
	}
	return out, rows.Err()
}
