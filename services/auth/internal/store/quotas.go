package store

import "context"

// AdminUpsertStorageQuotas sets (or creates) a user's mail/drive quota limits.
func (s *Store) AdminUpsertStorageQuotas(ctx context.Context, userID string, mailQuotaBytes, driveQuotaBytes int64) error {
	_, err := s.DB.Exec(ctx,
		`INSERT INTO storage_quotas (user_id, mail_quota_bytes, drive_quota_bytes, updated_at)
		 VALUES ($1, $2, $3, NOW())
		 ON CONFLICT (user_id) DO UPDATE SET
		   mail_quota_bytes = EXCLUDED.mail_quota_bytes,
		   drive_quota_bytes = EXCLUDED.drive_quota_bytes,
		   updated_at = NOW()`,
		userID, mailQuotaBytes, driveQuotaBytes,
	)
	return err
}

