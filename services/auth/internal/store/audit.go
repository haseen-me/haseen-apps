package store

import (
	"context"
	"encoding/json"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
)

func (s *Store) InsertAudit(ctx context.Context, actorID *string, action, targetType, targetID string, meta map[string]any, ip string) error {
	var b []byte
	var err error
	if meta == nil {
		b = []byte("{}")
	} else {
		b, err = json.Marshal(meta)
		if err != nil {
			return err
		}
	}
	_, err = s.DB.Exec(ctx,
		`INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata, ip_address)
		 VALUES ($1, $2, $3, $4, $5, NULLIF($6, '')::inet)`,
		actorID, action, targetType, targetID, b, ip,
	)
	return err
}

func (s *Store) ListAudit(ctx context.Context, limit int) ([]model.AuditEvent, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	rows, err := s.DB.Query(ctx,
		`SELECT id, actor_id, action, target_type, target_id, metadata,
		        COALESCE(ip_address::text, ''), created_at
		 FROM audit_log ORDER BY created_at DESC LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []model.AuditEvent
	for rows.Next() {
		var ev model.AuditEvent
		var actor *string
		var metaBytes []byte
		if err := rows.Scan(&ev.ID, &actor, &ev.Action, &ev.TargetType, &ev.TargetID, &metaBytes, &ev.IPAddress, &ev.CreatedAt); err != nil {
			return nil, err
		}
		ev.ActorID = actor
		ev.Metadata = map[string]any{}
		if len(metaBytes) > 0 {
			_ = json.Unmarshal(metaBytes, &ev.Metadata)
		}
		out = append(out, ev)
	}
	return out, rows.Err()
}
