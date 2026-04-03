package store

import (
	"context"
	"strings"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

// CreateMessage inserts a new message and returns its ID.
func (s *Store) CreateMessage(ctx context.Context, mailboxID, threadID string, msg *model.SendMessageRequest, fromAddr model.EmailAddress, labelID string) (string, error) {
	toAddrs := FormatAddresses(msg.To)
	ccAddrs := FormatAddresses(msg.Cc)
	bccAddrs := FormatAddresses(msg.Bcc)
	bodyText := stripHTML(msg.BodyHtml)

	var id string
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_messages
		   (thread_id, mailbox_id, from_address, to_addresses, cc_addresses, bcc_addresses,
		    encrypted_subject, encrypted_body, encrypted_session_key,
		    subject, body_html, body_text, is_read, starred, label_id)
		 VALUES ($1,$2,$3,$4,$5,$6, $7,$8,$9, $10,$11,$12, $13,$14,$15)
		 RETURNING id`,
		threadID, mailboxID, FormatAddress(fromAddr), toAddrs, ccAddrs, bccAddrs,
		[]byte{}, []byte{}, []byte{}, // encrypted fields placeholder
		msg.Subject, msg.BodyHtml, bodyText,
		true, false, labelID,
	).Scan(&id)
	return id, err
}

// CreateInboundMessage stores a message received via SMTP.
func (s *Store) CreateInboundMessage(ctx context.Context, mailboxID, threadID, labelID string, from string, to, cc []string, subject, bodyHTML, bodyText string) (string, error) {
	var id string
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_messages
		   (thread_id, mailbox_id, from_address, to_addresses, cc_addresses,
		    encrypted_subject, encrypted_body, encrypted_session_key,
		    subject, body_html, body_text, is_read, starred, label_id)
		 VALUES ($1,$2,$3,$4,$5, $6,$7,$8, $9,$10,$11, $12,$13,$14)
		 RETURNING id`,
		threadID, mailboxID, from, to, cc,
		[]byte{}, []byte{}, []byte{},
		subject, bodyHTML, bodyText,
		false, false, labelID,
	).Scan(&id)
	return id, err
}

// GetMessage returns a single message with its attachments.
func (s *Store) GetMessage(ctx context.Context, messageID string) (*model.Message, error) {
	var (
		fromRaw  string
		toRaw    []string
		ccRaw    []string
		bccRaw   []string
		labelID  *string
		created  time.Time
	)
	msg := &model.Message{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, thread_id, from_address, to_addresses, COALESCE(cc_addresses, '{}'),
		        COALESCE(bcc_addresses, '{}'), subject, COALESCE(body_html,''), COALESCE(body_text,''),
		        is_read, starred, label_id, created_at
		 FROM mail_messages WHERE id = $1`,
		messageID,
	).Scan(
		&msg.ID, &msg.ThreadID, &fromRaw, &toRaw, &ccRaw, &bccRaw,
		&msg.Subject, &msg.BodyHtml, &msg.BodyText,
		&msg.Read, &msg.Starred, &labelID, &created,
	)
	if err != nil {
		return nil, err
	}
	msg.From = ParseAddress(fromRaw)
	msg.To = ParseAddresses(toRaw)
	msg.Cc = ParseAddresses(ccRaw)
	msg.Bcc = ParseAddresses(bccRaw)
	msg.Date = created.Format(time.RFC3339)
	msg.Encrypted = true
	if labelID != nil {
		msg.Labels = []string{*labelID}
	}

	atts, err := s.GetAttachmentsByMessage(ctx, messageID)
	if err != nil {
		return nil, err
	}
	msg.Attachments = atts
	return msg, nil
}

// UpdateMessage updates read/starred flags and/or label.
func (s *Store) UpdateMessage(ctx context.Context, messageID string, req *model.UpdateMessageRequest) (*model.Message, error) {
	if req.Read != nil {
		if _, err := s.DB.Exec(ctx, `UPDATE mail_messages SET is_read = $2 WHERE id = $1`, messageID, *req.Read); err != nil {
			return nil, err
		}
	}
	if req.Starred != nil {
		if _, err := s.DB.Exec(ctx, `UPDATE mail_messages SET starred = $2 WHERE id = $1`, messageID, *req.Starred); err != nil {
			return nil, err
		}
	}
	return s.GetMessage(ctx, messageID)
}

// DeleteMessage removes a message.
func (s *Store) DeleteMessage(ctx context.Context, messageID string) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM mail_messages WHERE id = $1`, messageID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// MoveMessage changes the label (folder) of a message.
func (s *Store) MoveMessage(ctx context.Context, messageID, labelID string) (*model.Message, error) {
	tag, err := s.DB.Exec(ctx,
		`UPDATE mail_messages SET label_id = $2 WHERE id = $1`,
		messageID, labelID,
	)
	if err != nil {
		return nil, err
	}
	if tag.RowsAffected() == 0 {
		return nil, ErrNotFound
	}
	return s.GetMessage(ctx, messageID)
}

// GetMessagesByThread returns all messages in a thread ordered by date.
func (s *Store) GetMessagesByThread(ctx context.Context, threadID string) ([]model.Message, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, thread_id, from_address, to_addresses, COALESCE(cc_addresses,'{}'),
		        COALESCE(bcc_addresses,'{}'), subject, COALESCE(body_html,''), COALESCE(body_text,''),
		        is_read, starred, label_id, created_at
		 FROM mail_messages WHERE thread_id = $1
		 ORDER BY created_at ASC`,
		threadID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []model.Message
	for rows.Next() {
		var (
			fromRaw string
			toRaw   []string
			ccRaw   []string
			bccRaw  []string
			labelID *string
			created time.Time
		)
		m := model.Message{}
		if err := rows.Scan(
			&m.ID, &m.ThreadID, &fromRaw, &toRaw, &ccRaw, &bccRaw,
			&m.Subject, &m.BodyHtml, &m.BodyText,
			&m.Read, &m.Starred, &labelID, &created,
		); err != nil {
			return nil, err
		}
		m.From = ParseAddress(fromRaw)
		m.To = ParseAddresses(toRaw)
		m.Cc = ParseAddresses(ccRaw)
		m.Bcc = ParseAddresses(bccRaw)
		m.Date = created.Format(time.RFC3339)
		m.Encrypted = true
		if labelID != nil {
			m.Labels = []string{*labelID}
		}

		atts, _ := s.GetAttachmentsByMessage(ctx, m.ID)
		m.Attachments = atts
		msgs = append(msgs, m)
	}
	return msgs, rows.Err()
}

// stripHTML is a basic HTML tag stripper for generating body_text.
func stripHTML(html string) string {
	return StripHTMLHelper(html)
}

// StripHTMLHelper is the exported version of stripHTML used by the SMTP package.
func StripHTMLHelper(html string) string {
	var b strings.Builder
	inTag := false
	for _, r := range html {
		switch {
		case r == '<':
			inTag = true
		case r == '>':
			inTag = false
			b.WriteRune(' ')
		case !inTag:
			b.WriteRune(r)
		}
	}
	s := b.String()
	// Collapse whitespace
	for strings.Contains(s, "  ") {
		s = strings.ReplaceAll(s, "  ", " ")
	}
	return strings.TrimSpace(s)
}
