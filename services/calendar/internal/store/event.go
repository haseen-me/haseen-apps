package store

import (
	"context"
	"fmt"
	"time"

	"github.com/haseen-me/haseen-apps/services/calendar/internal/model"
	"github.com/jackc/pgx/v5"
)

func (s *Store) ListEvents(ctx context.Context, ownerID string, start, end time.Time, calendarID *string) ([]model.Event, error) {
	// Query both: non-recurring events in window + recurring templates that started before window end
	query := `SELECT id, calendar_id, owner_id, title, description, start_time, end_time, all_day, location, recurrence_rule, color, created_at, updated_at
		FROM events WHERE owner_id = $1
		AND ((recurrence_rule IS NULL AND start_time < $3 AND end_time > $2)
		  OR (recurrence_rule IS NOT NULL AND start_time < $3))`
	args := []interface{}{ownerID, start, end}

	if calendarID != nil {
		query += " AND calendar_id = $4"
		args = append(args, *calendarID)
	}
	query += " ORDER BY start_time"

	rows, err := s.DB.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list events: %w", err)
	}
	defer rows.Close()

	var events []model.Event
	for rows.Next() {
		var e model.Event
		if err := rows.Scan(&e.ID, &e.CalendarID, &e.OwnerID, &e.Title, &e.Description,
			&e.StartTime, &e.EndTime, &e.AllDay, &e.Location, &e.RecurrenceRule,
			&e.Color, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan event: %w", err)
		}

		if e.RecurrenceRule != nil && *e.RecurrenceRule != "" {
			// Expand recurring event into instances within the window
			instances := expandRecurring(e, start, end)
			events = append(events, instances...)
		} else {
			events = append(events, e)
		}
	}
	return events, rows.Err()
}

func (s *Store) GetEvent(ctx context.Context, id, ownerID string) (model.Event, error) {
	var e model.Event
	err := s.DB.QueryRow(ctx,
		"SELECT id, calendar_id, owner_id, title, description, start_time, end_time, all_day, location, recurrence_rule, color, created_at, updated_at FROM events WHERE id = $1 AND owner_id = $2",
		id, ownerID).
		Scan(&e.ID, &e.CalendarID, &e.OwnerID, &e.Title, &e.Description,
			&e.StartTime, &e.EndTime, &e.AllDay, &e.Location, &e.RecurrenceRule,
			&e.Color, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return e, ErrNotFound
		}
		return e, fmt.Errorf("get event: %w", err)
	}
	return e, nil
}

func (s *Store) CreateEvent(ctx context.Context, ownerID string, req model.CreateEventRequest) (model.Event, error) {
	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		return model.Event{}, fmt.Errorf("parse start time: %w", err)
	}
	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		return model.Event{}, fmt.Errorf("parse end time: %w", err)
	}

	var e model.Event
	err = s.DB.QueryRow(ctx,
		`INSERT INTO events (calendar_id, owner_id, title, description, start_time, end_time, all_day, location, recurrence_rule, color)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
 RETURNING id, calendar_id, owner_id, title, description, start_time, end_time, all_day, location, recurrence_rule, color, created_at, updated_at`,
		req.CalendarID, ownerID, req.Title, req.Description, startTime, endTime,
		req.AllDay, req.Location, req.RecurrenceRule, req.Color).
		Scan(&e.ID, &e.CalendarID, &e.OwnerID, &e.Title, &e.Description,
			&e.StartTime, &e.EndTime, &e.AllDay, &e.Location, &e.RecurrenceRule,
			&e.Color, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		return e, fmt.Errorf("create event: %w", err)
	}
	return e, nil
}

func (s *Store) UpdateEvent(ctx context.Context, id, ownerID string, req model.UpdateEventRequest) (model.Event, error) {
	var startTime, endTime *time.Time
	if req.StartTime != nil {
		t, err := time.Parse(time.RFC3339, *req.StartTime)
		if err != nil {
			return model.Event{}, fmt.Errorf("parse start time: %w", err)
		}
		startTime = &t
	}
	if req.EndTime != nil {
		t, err := time.Parse(time.RFC3339, *req.EndTime)
		if err != nil {
			return model.Event{}, fmt.Errorf("parse end time: %w", err)
		}
		endTime = &t
	}

	var e model.Event
	err := s.DB.QueryRow(ctx,
		`UPDATE events SET
title = COALESCE($3, title),
description = COALESCE($4, description),
start_time = COALESCE($5, start_time),
end_time = COALESCE($6, end_time),
all_day = COALESCE($7, all_day),
location = COALESCE($8, location),
recurrence_rule = COALESCE($9, recurrence_rule),
color = COALESCE($10, color),
updated_at = now()
WHERE id = $1 AND owner_id = $2
RETURNING id, calendar_id, owner_id, title, description, start_time, end_time, all_day, location, recurrence_rule, color, created_at, updated_at`,
		id, ownerID, req.Title, req.Description, startTime, endTime,
		req.AllDay, req.Location, req.RecurrenceRule, req.Color).
		Scan(&e.ID, &e.CalendarID, &e.OwnerID, &e.Title, &e.Description,
			&e.StartTime, &e.EndTime, &e.AllDay, &e.Location, &e.RecurrenceRule,
			&e.Color, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return e, ErrNotFound
		}
		return e, fmt.Errorf("update event: %w", err)
	}
	return e, nil
}

func (s *Store) DeleteEvent(ctx context.Context, id, ownerID string) error {
	tag, err := s.DB.Exec(ctx, "DELETE FROM events WHERE id = $1 AND owner_id = $2", id, ownerID)
	if err != nil {
		return fmt.Errorf("delete event: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// --- Attendees ---

func (s *Store) ListAttendees(ctx context.Context, eventID string) ([]model.Attendee, error) {
	rows, err := s.DB.Query(ctx,
		"SELECT id, event_id, email, status FROM event_attendees WHERE event_id = $1 ORDER BY email",
		eventID)
	if err != nil {
		return nil, fmt.Errorf("list attendees: %w", err)
	}
	defer rows.Close()

	var attendees []model.Attendee
	for rows.Next() {
		var a model.Attendee
		if err := rows.Scan(&a.ID, &a.EventID, &a.Email, &a.Status); err != nil {
			return nil, fmt.Errorf("scan attendee: %w", err)
		}
		attendees = append(attendees, a)
	}
	return attendees, rows.Err()
}

func (s *Store) AddAttendee(ctx context.Context, eventID, email string) (model.Attendee, error) {
	var a model.Attendee
	err := s.DB.QueryRow(ctx,
		"INSERT INTO event_attendees (event_id, email) VALUES ($1, $2) RETURNING id, event_id, email, status",
		eventID, email).
		Scan(&a.ID, &a.EventID, &a.Email, &a.Status)
	if err != nil {
		return a, fmt.Errorf("add attendee: %w", err)
	}
	return a, nil
}

func (s *Store) RemoveAttendee(ctx context.Context, attendeeID string) error {
	tag, err := s.DB.Exec(ctx, "DELETE FROM event_attendees WHERE id = $1", attendeeID)
	if err != nil {
		return fmt.Errorf("remove attendee: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (s *Store) UpdateAttendeeStatus(ctx context.Context, attendeeID, status string) (model.Attendee, error) {
	var a model.Attendee
	err := s.DB.QueryRow(ctx,
		"UPDATE event_attendees SET status = $1 WHERE id = $2 RETURNING id, event_id, email, status",
		status, attendeeID).
		Scan(&a.ID, &a.EventID, &a.Email, &a.Status)
	if err != nil {
		return a, fmt.Errorf("update attendee status: %w", err)
	}
	return a, nil
}

// --- Reminders ---

func (s *Store) ListReminders(ctx context.Context, eventID string) ([]model.Reminder, error) {
	rows, err := s.DB.Query(ctx,
		"SELECT id, event_id, minutes_before FROM reminders WHERE event_id = $1 ORDER BY minutes_before",
		eventID)
	if err != nil {
		return nil, fmt.Errorf("list reminders: %w", err)
	}
	defer rows.Close()

	var reminders []model.Reminder
	for rows.Next() {
		var r model.Reminder
		if err := rows.Scan(&r.ID, &r.EventID, &r.MinutesBefore); err != nil {
			return nil, fmt.Errorf("scan reminder: %w", err)
		}
		reminders = append(reminders, r)
	}
	return reminders, rows.Err()
}

func (s *Store) SetReminder(ctx context.Context, eventID string, minutesBefore int) (model.Reminder, error) {
	var r model.Reminder
	err := s.DB.QueryRow(ctx,
		"INSERT INTO reminders (event_id, minutes_before) VALUES ($1, $2) ON CONFLICT (event_id, minutes_before) DO UPDATE SET minutes_before = EXCLUDED.minutes_before RETURNING id, event_id, minutes_before",
		eventID, minutesBefore).
		Scan(&r.ID, &r.EventID, &r.MinutesBefore)
	if err != nil {
		return r, fmt.Errorf("set reminder: %w", err)
	}
	return r, nil
}

func (s *Store) DeleteReminder(ctx context.Context, reminderID string) error {
	tag, err := s.DB.Exec(ctx, "DELETE FROM reminders WHERE id = $1", reminderID)
	if err != nil {
		return fmt.Errorf("delete reminder: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
