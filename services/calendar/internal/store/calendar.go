package store

import (
	"context"
	"fmt"

	"github.com/haseen-me/haseen-apps/services/calendar/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) ListCalendars(ctx context.Context, ownerID string) ([]model.Calendar, error) {
	rows, err := s.DB.Query(ctx,
		"SELECT id, owner_id, name, color, is_default, created_at, updated_at FROM calendars WHERE owner_id = $1 ORDER BY is_default DESC, name",
		ownerID)
	if err != nil {
		return nil, fmt.Errorf("list calendars: %w", err)
	}
	defer rows.Close()

	var cals []model.Calendar
	for rows.Next() {
		var c model.Calendar
		if err := rows.Scan(&c.ID, &c.OwnerID, &c.Name, &c.Color, &c.IsDefault, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan calendar: %w", err)
		}
		cals = append(cals, c)
	}
	return cals, rows.Err()
}

func (s *Store) GetCalendar(ctx context.Context, id, ownerID string) (model.Calendar, error) {
	var c model.Calendar
	err := s.DB.QueryRow(ctx,
		"SELECT id, owner_id, name, color, is_default, created_at, updated_at FROM calendars WHERE id = $1 AND owner_id = $2",
		id, ownerID).
		Scan(&c.ID, &c.OwnerID, &c.Name, &c.Color, &c.IsDefault, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c, ErrNotFound
		}
		return c, fmt.Errorf("get calendar: %w", err)
	}
	return c, nil
}

func (s *Store) CreateCalendar(ctx context.Context, ownerID, name, color string) (model.Calendar, error) {
	var c model.Calendar
	err := s.DB.QueryRow(ctx,
		"INSERT INTO calendars (owner_id, name, color) VALUES ($1, $2, $3) RETURNING id, owner_id, name, color, is_default, created_at, updated_at",
		ownerID, name, color).
		Scan(&c.ID, &c.OwnerID, &c.Name, &c.Color, &c.IsDefault, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		return c, fmt.Errorf("create calendar: %w", err)
	}
	return c, nil
}

func (s *Store) UpdateCalendar(ctx context.Context, id, ownerID string, name, color *string) (model.Calendar, error) {
	var c model.Calendar
	err := s.DB.QueryRow(ctx,
		`UPDATE calendars SET
name = COALESCE($3, name),
color = COALESCE($4, color),
updated_at = now()
WHERE id = $1 AND owner_id = $2
RETURNING id, owner_id, name, color, is_default, created_at, updated_at`,
		id, ownerID, name, color).
		Scan(&c.ID, &c.OwnerID, &c.Name, &c.Color, &c.IsDefault, &c.CreatedAt, &c.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return c, ErrNotFound
		}
		return c, fmt.Errorf("update calendar: %w", err)
	}
	return c, nil
}

func (s *Store) DeleteCalendar(ctx context.Context, id, ownerID string) error {
	tag, err := s.DB.Exec(ctx, "DELETE FROM calendars WHERE id = $1 AND owner_id = $2", id, ownerID)
	if err != nil {
		return fmt.Errorf("delete calendar: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
