package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// CreateAttachment stores email attachment metadata and encrypted data.
func (s *Store) CreateAttachment(ctx context.Context, messageID, filename, mimeType string, size int64, data []byte) (string, error) {
	var id string
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_attachments (message_id, filename, mime_type, size, encrypted_data)
		 VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		messageID, filename, mimeType, size, data,
	).Scan(&id)
	return id, err
}

// GetAttachmentsByMessage returns attachment metadata (without data) for a message.
func (s *Store) GetAttachmentsByMessage(ctx context.Context, messageID string) ([]model.Attachment, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, filename, mime_type, size FROM mail_attachments WHERE message_id = $1`,
		messageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var atts []model.Attachment
	for rows.Next() {
		var a model.Attachment
		if err := rows.Scan(&a.ID, &a.Filename, &a.ContentType, &a.Size); err != nil {
			return nil, err
		}
		a.MessageID = messageID
		atts = append(atts, a)
	}
	if atts == nil {
		atts = []model.Attachment{}
	}
	return atts, rows.Err()
}

// GetAttachmentData returns the raw (encrypted) data of an attachment.
func (s *Store) GetAttachmentData(ctx context.Context, attachmentID string) ([]byte, string, string, error) {
	var data []byte
	var filename, mimeType string
	err := s.DB.QueryRow(ctx,
		`SELECT encrypted_data, filename, mime_type FROM mail_attachments WHERE id = $1`,
		attachmentID,
	).Scan(&data, &filename, &mimeType)
	return data, filename, mimeType, err
}

// GetAttachmentDataForMailbox returns attachment data only if the attachment belongs to the given mailbox.
func (s *Store) GetAttachmentDataForMailbox(ctx context.Context, attachmentID, mailboxID string) ([]byte, string, string, error) {
	var data []byte
	var filename, mimeType string
	err := s.DB.QueryRow(ctx,
		`SELECT a.encrypted_data, a.filename, a.mime_type
		 FROM mail_attachments a
		 JOIN mail_messages m ON m.id = a.message_id
		 WHERE a.id = $1 AND m.mailbox_id = $2`,
		attachmentID, mailboxID,
	).Scan(&data, &filename, &mimeType)
	return data, filename, mimeType, err
}
