package store

import (
	"context"
	"encoding/base64"
	"errors"

	"github.com/haseen-me/haseen-apps/services/contacts/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) CreateContact(ctx context.Context, userID string, req *model.UpsertContactRequest) (*model.ContactRecord, error) {
	encrypted, err := base64.StdEncoding.DecodeString(req.EncryptedData)
	if err != nil {
		return nil, err
	}

	record := &model.ContactRecord{}
	err = s.DB.QueryRow(ctx,
		`INSERT INTO contacts (user_id, encrypted_data)
		 VALUES ($1, $2)
		 RETURNING id, encrypted_data, created_at, updated_at`,
		userID, encrypted,
	).Scan(&record.ID, &encrypted, &record.CreatedAt, &record.UpdatedAt)
	if err != nil {
		return nil, err
	}

	record.EncryptedData = base64.StdEncoding.EncodeToString(encrypted)
	return record, nil
}

func (s *Store) GetContact(ctx context.Context, userID, contactID string) (*model.ContactRecord, error) {
	record := &model.ContactRecord{}
	var encrypted []byte
	err := s.DB.QueryRow(ctx,
		`SELECT id, encrypted_data, created_at, updated_at
		 FROM contacts
		 WHERE id = $1 AND user_id = $2`,
		contactID, userID,
	).Scan(&record.ID, &encrypted, &record.CreatedAt, &record.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	record.EncryptedData = base64.StdEncoding.EncodeToString(encrypted)
	return record, nil
}

func (s *Store) ListContacts(ctx context.Context, userID string) ([]model.ContactRecord, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, encrypted_data, created_at, updated_at
		 FROM contacts
		 WHERE user_id = $1
		 ORDER BY updated_at DESC, id DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contacts := make([]model.ContactRecord, 0)
	for rows.Next() {
		var record model.ContactRecord
		var encrypted []byte
		if err := rows.Scan(&record.ID, &encrypted, &record.CreatedAt, &record.UpdatedAt); err != nil {
			return nil, err
		}
		record.EncryptedData = base64.StdEncoding.EncodeToString(encrypted)
		contacts = append(contacts, record)
	}

	return contacts, rows.Err()
}

func (s *Store) UpdateContact(ctx context.Context, userID, contactID string, req *model.UpsertContactRequest) (*model.ContactRecord, error) {
	encrypted, err := base64.StdEncoding.DecodeString(req.EncryptedData)
	if err != nil {
		return nil, err
	}

	record := &model.ContactRecord{}
	err = s.DB.QueryRow(ctx,
		`UPDATE contacts
		 SET encrypted_data = $3, updated_at = now()
		 WHERE id = $1 AND user_id = $2
		 RETURNING id, encrypted_data, created_at, updated_at`,
		contactID, userID, encrypted,
	).Scan(&record.ID, &encrypted, &record.CreatedAt, &record.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	record.EncryptedData = base64.StdEncoding.EncodeToString(encrypted)
	return record, nil
}

func (s *Store) DeleteContact(ctx context.Context, userID, contactID string) error {
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM contacts WHERE id = $1 AND user_id = $2`,
		contactID, userID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
