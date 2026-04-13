package store

import "context"

func (s *Store) AdminMailMessageStats(ctx context.Context) (sent int64, received int64, err error) {
	err = s.DB.QueryRow(ctx, `
		SELECT
		  COUNT(*) FILTER (WHERE LOWER(l.name) = 'sent')::bigint AS sent,
		  COUNT(*) FILTER (WHERE LOWER(l.name) = 'inbox')::bigint AS inbox
		FROM mail_messages m
		JOIN mail_labels l ON l.id = m.label_id`,
	).Scan(&sent, &received)
	return
}

func (s *Store) AdminDriveUsageStats(ctx context.Context) (fileCount int64, totalBytes int64, err error) {
	err = s.DB.QueryRow(ctx,
		`SELECT COUNT(*)::bigint, COALESCE(SUM(size),0)::bigint FROM drive_files WHERE deleted_at IS NULL`,
	).Scan(&fileCount, &totalBytes)
	return
}

func (s *Store) AdminR2AttachmentRefStats(ctx context.Context) (refCount int64, totalBytes int64, err error) {
	err = s.DB.QueryRow(ctx,
		`SELECT COUNT(*)::bigint, COALESCE(SUM(size),0)::bigint FROM mail_attachment_refs`,
	).Scan(&refCount, &totalBytes)
	return
}

// AdminOverviewMetrics returns coarse system-wide metrics for the admin console.
func (s *Store) AdminOverviewMetrics(ctx context.Context) (map[string]any, error) {
	// Active sessions
	var activeSessions int64
	_ = s.DB.QueryRow(ctx, `SELECT COUNT(*)::bigint FROM sessions WHERE expires_at > NOW()`).Scan(&activeSessions)

	// Outbound queue totals by status (best-effort)
	queued, sending, sent, deferred, failed, _ := s.AdminQueueStats(ctx)

	// Mail message totals (sent/received approximations)
	// Sent ~= messages labeled "Sent"; Received ~= messages labeled "Inbox"
	sentMsgs, inboxMsgs, _ := s.AdminMailMessageStats(ctx)

	// Attachment refs (R2-backed) + legacy inline attachments
	r2AttachCount, r2AttachBytes, _ := s.AdminR2AttachmentRefStats(ctx)
	legacyCount, legacyBytes, _ := s.AdminAttachmentStats(ctx)

	// Drive usage
	_, driveBytes, _ := s.AdminDriveUsageStats(ctx)

	return map[string]any{
		"activeSessions": activeSessions,
		"outboundQueue": map[string]any{
			"queued": queued, "sending": sending, "sent": sent, "deferred": deferred, "failed": failed,
		},
		"mail": map[string]any{
			"sentMessages": sentMsgs,
			"inboxMessages": inboxMsgs,
		},
		"attachments": map[string]any{
			"r2RefCount":  r2AttachCount,
			"r2RefBytes":  r2AttachBytes,
			"inlineCount": legacyCount,
			"inlineBytes": legacyBytes,
		},
		"drive": map[string]any{
			"usedBytes": driveBytes,
		},
	}, nil
}

