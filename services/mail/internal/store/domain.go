package store

import (
	"context"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
)

func (s *Store) CreateDomain(ctx context.Context, userID, domain, verificationToken string) (*model.CustomDomain, error) {
	d := &model.CustomDomain{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO custom_domains (user_id, domain, verification_token)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, domain, status, mx_verified, spf_verified, dkim_verified,
		           dmarc_verified, verification_token, last_checked_at, verified_at, created_at, updated_at`,
		userID, domain, verificationToken,
	).Scan(
		&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified,
		&d.DKIMVerified, &d.DMARCVerified, &d.VerificationToken,
		&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt, &d.UpdatedAt,
	)
	return d, err
}

func (s *Store) GetDomainsByUser(ctx context.Context, userID string) ([]model.CustomDomain, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, domain, status, mx_verified, spf_verified, dkim_verified,
		        dmarc_verified, verification_token, last_checked_at, verified_at, created_at, updated_at
		 FROM custom_domains WHERE user_id = $1 ORDER BY created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []model.CustomDomain
	for rows.Next() {
		d := model.CustomDomain{}
		if err := rows.Scan(
			&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified,
			&d.DKIMVerified, &d.DMARCVerified, &d.VerificationToken,
			&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		domains = append(domains, d)
	}
	return domains, rows.Err()
}

func (s *Store) GetDomain(ctx context.Context, domainID, userID string) (*model.CustomDomain, error) {
	d := &model.CustomDomain{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, user_id, domain, status, mx_verified, spf_verified, dkim_verified,
		        dmarc_verified, verification_token, last_checked_at, verified_at, created_at, updated_at
		 FROM custom_domains WHERE id = $1 AND user_id = $2`,
		domainID, userID,
	).Scan(
		&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified,
		&d.DKIMVerified, &d.DMARCVerified, &d.VerificationToken,
		&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt, &d.UpdatedAt,
	)
	return d, err
}

func (s *Store) GetDomainByName(ctx context.Context, domainName string) (*model.CustomDomain, error) {
	d := &model.CustomDomain{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, user_id, domain, status, mx_verified, spf_verified, dkim_verified,
		        dmarc_verified, verification_token, last_checked_at, verified_at, created_at, updated_at
		 FROM custom_domains WHERE domain = $1`,
		domainName,
	).Scan(
		&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified,
		&d.DKIMVerified, &d.DMARCVerified, &d.VerificationToken,
		&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt, &d.UpdatedAt,
	)
	return d, err
}

func (s *Store) UpdateDomainVerification(ctx context.Context, domainID string, mx, spf, dkim, dmarc bool) error {
	status := "verifying"
	var verifiedAt *time.Time
	if mx && spf && dkim && dmarc {
		status = "verified"
		now := time.Now()
		verifiedAt = &now
	}

	_, err := s.DB.Exec(ctx,
		`UPDATE custom_domains SET
			mx_verified = $2, spf_verified = $3, dkim_verified = $4, dmarc_verified = $5,
			status = $6, verified_at = COALESCE($7, verified_at),
			last_checked_at = NOW(), updated_at = NOW()
		 WHERE id = $1`,
		domainID, mx, spf, dkim, dmarc, status, verifiedAt,
	)
	return err
}

func (s *Store) DeleteDomain(ctx context.Context, domainID, userID string) error {
	tag, err := s.DB.Exec(ctx,
		`DELETE FROM custom_domains WHERE id = $1 AND user_id = $2`,
		domainID, userID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) GetPendingDomains(ctx context.Context) ([]model.CustomDomain, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, user_id, domain, status, mx_verified, spf_verified, dkim_verified,
		        dmarc_verified, verification_token, last_checked_at, verified_at, created_at, updated_at
		 FROM custom_domains
		 WHERE status IN ('pending', 'verifying')
		 ORDER BY last_checked_at ASC NULLS FIRST
		 LIMIT 50`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var domains []model.CustomDomain
	for rows.Next() {
		d := model.CustomDomain{}
		if err := rows.Scan(
			&d.ID, &d.UserID, &d.Domain, &d.Status, &d.MXVerified, &d.SPFVerified,
			&d.DKIMVerified, &d.DMARCVerified, &d.VerificationToken,
			&d.LastCheckedAt, &d.VerifiedAt, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		domains = append(domains, d)
	}
	return domains, rows.Err()
}

// --- DKIM Keys ---

func (s *Store) CreateDKIMKey(ctx context.Context, domainID, selector string, encKey, iv []byte, pubKey string, keySize int) (*model.DKIMKey, error) {
	k := &model.DKIMKey{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO dkim_keys (domain_id, selector, private_key_enc, private_key_iv, public_key, key_size)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, domain_id, selector, public_key, key_size, active, created_at, rotated_at`,
		domainID, selector, encKey, iv, pubKey, keySize,
	).Scan(&k.ID, &k.DomainID, &k.Selector, &k.PublicKey, &k.KeySize, &k.Active, &k.CreatedAt, &k.RotatedAt)
	return k, err
}

func (s *Store) GetActiveDKIMKey(ctx context.Context, domainID string) (*model.DKIMKey, error) {
	k := &model.DKIMKey{}
	err := s.DB.QueryRow(ctx,
		`SELECT id, domain_id, selector, private_key_enc, private_key_iv, public_key, key_size, active, created_at, rotated_at
		 FROM dkim_keys WHERE domain_id = $1 AND active = TRUE
		 ORDER BY created_at DESC LIMIT 1`,
		domainID,
	).Scan(&k.ID, &k.DomainID, &k.Selector, &k.PrivateKeyEnc, &k.PrivateKeyIV, &k.PublicKey, &k.KeySize, &k.Active, &k.CreatedAt, &k.RotatedAt)
	return k, err
}

func (s *Store) GetDKIMKeysByDomain(ctx context.Context, domainID string) ([]model.DKIMKey, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, domain_id, selector, public_key, key_size, active, created_at, rotated_at
		 FROM dkim_keys WHERE domain_id = $1 ORDER BY created_at DESC`,
		domainID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []model.DKIMKey
	for rows.Next() {
		k := model.DKIMKey{}
		if err := rows.Scan(&k.ID, &k.DomainID, &k.Selector, &k.PublicKey, &k.KeySize, &k.Active, &k.CreatedAt, &k.RotatedAt); err != nil {
			return nil, err
		}
		keys = append(keys, k)
	}
	return keys, rows.Err()
}

// --- Domain Mailboxes ---

func (s *Store) CreateDomainMailbox(ctx context.Context, domainID, userID, localPart, displayName string, isCatchAll bool) (*model.DomainMailbox, error) {
	mb := &model.DomainMailbox{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO domain_mailboxes (domain_id, user_id, local_part, display_name, is_catchall)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, domain_id, user_id, local_part, display_name, is_catchall, created_at`,
		domainID, userID, localPart, displayName, isCatchAll,
	).Scan(&mb.ID, &mb.DomainID, &mb.UserID, &mb.LocalPart, &mb.DisplayName, &mb.IsCatchAll, &mb.CreatedAt)
	return mb, err
}

func (s *Store) GetDomainMailboxes(ctx context.Context, domainID string) ([]model.DomainMailbox, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, domain_id, user_id, local_part, display_name, is_catchall, created_at
		 FROM domain_mailboxes WHERE domain_id = $1 ORDER BY local_part`,
		domainID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var mailboxes []model.DomainMailbox
	for rows.Next() {
		mb := model.DomainMailbox{}
		if err := rows.Scan(&mb.ID, &mb.DomainID, &mb.UserID, &mb.LocalPart, &mb.DisplayName, &mb.IsCatchAll, &mb.CreatedAt); err != nil {
			return nil, err
		}
		mailboxes = append(mailboxes, mb)
	}
	return mailboxes, rows.Err()
}

func (s *Store) DeleteDomainMailbox(ctx context.Context, mailboxID, domainID string) error {
	tag, err := s.DB.Exec(ctx, `DELETE FROM domain_mailboxes WHERE id = $1 AND domain_id = $2`, mailboxID, domainID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) FindDomainMailboxByAddress(ctx context.Context, localPart, domainName string) (*model.DomainMailbox, error) {
	mb := &model.DomainMailbox{}
	err := s.DB.QueryRow(ctx,
		`SELECT dm.id, dm.domain_id, dm.user_id, dm.local_part, dm.display_name, dm.is_catchall, dm.created_at
		 FROM domain_mailboxes dm
		 JOIN custom_domains cd ON cd.id = dm.domain_id
		 WHERE cd.domain = $1 AND (dm.local_part = $2 OR dm.is_catchall = TRUE)
		   AND cd.status = 'verified'
		 ORDER BY CASE WHEN dm.local_part = $2 THEN 0 ELSE 1 END
		 LIMIT 1`,
		domainName, localPart,
	).Scan(&mb.ID, &mb.DomainID, &mb.UserID, &mb.LocalPart, &mb.DisplayName, &mb.IsCatchAll, &mb.CreatedAt)
	return mb, err
}

// --- Outbound Queue ---

func (s *Store) EnqueueOutbound(ctx context.Context, msg *model.OutboundMessage) (*model.OutboundMessage, error) {
	err := s.DB.QueryRow(ctx,
		`INSERT INTO outbound_queue (user_id, domain_id, from_address, to_addresses, cc_addresses, bcc_addresses,
		                             subject, body_html, body_text)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 RETURNING id, status, attempts, max_attempts, next_retry_at, created_at`,
		msg.UserID, msg.DomainID, msg.FromAddress, msg.ToAddresses, msg.CcAddresses, msg.BccAddresses,
		msg.Subject, msg.BodyHTML, msg.BodyText,
	).Scan(&msg.ID, &msg.Status, &msg.Attempts, &msg.MaxAttempts, &msg.NextRetryAt, &msg.CreatedAt)
	return msg, err
}

func (s *Store) GetQueuedMessages(ctx context.Context, limit int) ([]model.OutboundMessage, error) {
	rows, err := s.DB.Query(ctx,
		`UPDATE outbound_queue SET status = 'sending', attempts = attempts + 1
		 WHERE id IN (
			SELECT id FROM outbound_queue
			WHERE status IN ('queued', 'deferred') AND next_retry_at <= NOW()
			ORDER BY next_retry_at ASC
			LIMIT $1
			FOR UPDATE SKIP LOCKED
		 )
		 RETURNING id, user_id, domain_id, from_address, to_addresses,
		           COALESCE(cc_addresses, '{}'), COALESCE(bcc_addresses, '{}'),
		           subject, body_html, body_text, status, attempts, max_attempts,
		           COALESCE(last_error, ''), next_retry_at, sent_at, created_at`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []model.OutboundMessage
	for rows.Next() {
		m := model.OutboundMessage{}
		if err := rows.Scan(
			&m.ID, &m.UserID, &m.DomainID, &m.FromAddress, &m.ToAddresses,
			&m.CcAddresses, &m.BccAddresses, &m.Subject, &m.BodyHTML, &m.BodyText,
			&m.Status, &m.Attempts, &m.MaxAttempts, &m.LastError,
			&m.NextRetryAt, &m.SentAt, &m.CreatedAt,
		); err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	return msgs, rows.Err()
}

func (s *Store) MarkMessageSent(ctx context.Context, msgID string) error {
	_, err := s.DB.Exec(ctx,
		`UPDATE outbound_queue SET status = 'sent', sent_at = NOW() WHERE id = $1`, msgID)
	return err
}

func (s *Store) MarkMessageFailed(ctx context.Context, msgID, lastError string, attempts, maxAttempts int) error {
	status := "deferred"
	if attempts >= maxAttempts {
		status = "failed"
	}
	retryDelay := time.Duration(1<<uint(attempts)) * time.Minute
	_, err := s.DB.Exec(ctx,
		`UPDATE outbound_queue SET status = $2, last_error = $3, next_retry_at = $4 WHERE id = $1`,
		msgID, status, lastError, time.Now().Add(retryDelay))
	return err
}

// --- DNS Check Log ---

func (s *Store) LogDNSCheck(ctx context.Context, domainID, checkType string, passed bool, expected, actual string) error {
	_, err := s.DB.Exec(ctx,
		`INSERT INTO dns_check_log (domain_id, check_type, passed, expected_value, actual_value)
		 VALUES ($1, $2, $3, $4, $5)`,
		domainID, checkType, passed, expected, actual)
	return err
}

func (s *Store) GetDNSCheckLogs(ctx context.Context, domainID string, limit int) ([]model.DNSCheckLog, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, domain_id, check_type, passed, COALESCE(expected_value, ''), COALESCE(actual_value, ''), checked_at
		 FROM dns_check_log WHERE domain_id = $1
		 ORDER BY checked_at DESC LIMIT $2`,
		domainID, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []model.DNSCheckLog
	for rows.Next() {
		l := model.DNSCheckLog{}
		if err := rows.Scan(&l.ID, &l.DomainID, &l.CheckType, &l.Passed, &l.ExpectedValue, &l.ActualValue, &l.CheckedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

// --- R2 Attachment Refs ---

func (s *Store) CreateAttachmentRef(ctx context.Context, messageID, filename, mimeType string, size int64, bucket, key string) (*model.AttachmentRef, error) {
	ref := &model.AttachmentRef{}
	err := s.DB.QueryRow(ctx,
		`INSERT INTO mail_attachment_refs (message_id, filename, mime_type, size, r2_bucket, r2_key)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, message_id, filename, mime_type, size, r2_bucket, r2_key, created_at`,
		messageID, filename, mimeType, size, bucket, key,
	).Scan(&ref.ID, &ref.MessageID, &ref.Filename, &ref.MimeType, &ref.Size, &ref.R2Bucket, &ref.R2Key, &ref.CreatedAt)
	return ref, err
}

func (s *Store) GetAttachmentRefsByMessage(ctx context.Context, messageID string) ([]model.AttachmentRef, error) {
	rows, err := s.DB.Query(ctx,
		`SELECT id, message_id, filename, mime_type, size, r2_bucket, r2_key, created_at
		 FROM mail_attachment_refs WHERE message_id = $1 ORDER BY created_at`,
		messageID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var refs []model.AttachmentRef
	for rows.Next() {
		ref := model.AttachmentRef{}
		if err := rows.Scan(&ref.ID, &ref.MessageID, &ref.Filename, &ref.MimeType, &ref.Size, &ref.R2Bucket, &ref.R2Key, &ref.CreatedAt); err != nil {
			return nil, err
		}
		refs = append(refs, ref)
	}
	return refs, rows.Err()
}

// --- Custom domain user lookup (for SMTP) ---

func (s *Store) GetUserByDomainEmail(ctx context.Context, email string) (string, error) {
	parts := splitEmail(email)
	if len(parts) != 2 {
		return "", ErrNotFound
	}
	localPart := parts[0]
	domainName := parts[1]

	mb, err := s.FindDomainMailboxByAddress(ctx, localPart, domainName)
	if err != nil {
		return "", err
	}
	return mb.UserID, nil
}

func splitEmail(email string) []string {
	at := -1
	for i, c := range email {
		if c == '@' {
			at = i
			break
		}
	}
	if at < 0 {
		return nil
	}
	return []string{email[:at], email[at+1:]}
}

// GetDomainByDKIMKey returns the domain name for a DKIM key's domain ID.
func (s *Store) GetDomainByDKIMKey(ctx context.Context, domainID string) (string, error) {
	var domainName string
	err := s.DB.QueryRow(ctx,
		`SELECT domain FROM custom_domains WHERE id = $1`,
		domainID,
	).Scan(&domainName)
	return domainName, err
}

// IsCustomDomain checks if a domain is a registered custom domain.
func (s *Store) IsCustomDomain(ctx context.Context, domainName string) bool {
	var count int
	err := s.DB.QueryRow(ctx,
		`SELECT COUNT(*) FROM custom_domains WHERE domain = $1 AND status = 'verified'`,
		domainName,
	).Scan(&count)
	return err == nil && count > 0
}
