package model

import "time"

// ---------- Calendar ----------

type Calendar struct {
	ID        string    `json:"id"`
	OwnerID   string    `json:"-"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	IsDefault bool      `json:"isDefault"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ---------- Event ----------

type Event struct {
	ID             string    `json:"id"`
	CalendarID     string    `json:"calendarId"`
	OwnerID        string    `json:"-"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	StartTime      time.Time `json:"startTime"`
	EndTime        time.Time `json:"endTime"`
	AllDay         bool      `json:"allDay"`
	Location       string    `json:"location"`
	RecurrenceRule *string   `json:"recurrenceRule"`
	Color          string    `json:"color"`
	EncryptedData  *string   `json:"-"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`
	AttendeeCount  int       `json:"attendeeCount"`
}

// ---------- Attendee ----------

type Attendee struct {
	ID      string `json:"id"`
	EventID string `json:"eventId"`
	Email   string `json:"email"`
	Status  string `json:"status"`
}

// ---------- Reminder ----------

type Reminder struct {
	ID            string `json:"id"`
	EventID       string `json:"eventId"`
	MinutesBefore int    `json:"minutesBefore"`
}

// ---------- API Requests ----------

type CreateCalendarRequest struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type UpdateCalendarRequest struct {
	Name  *string `json:"name"`
	Color *string `json:"color"`
}

type CreateEventRequest struct {
	CalendarID     string  `json:"calendarId"`
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	StartTime      string  `json:"startTime"`
	EndTime        string  `json:"endTime"`
	AllDay         bool    `json:"allDay"`
	Location       string  `json:"location"`
	RecurrenceRule *string `json:"recurrenceRule"`
	Color          string  `json:"color"`
}

type UpdateEventRequest struct {
	Title          *string `json:"title"`
	Description    *string `json:"description"`
	StartTime      *string `json:"startTime"`
	EndTime        *string `json:"endTime"`
	AllDay         *bool   `json:"allDay"`
	Location       *string `json:"location"`
	RecurrenceRule *string `json:"recurrenceRule"`
	Color          *string `json:"color"`
}

type AddAttendeeRequest struct {
	Email string `json:"email"`
}

type SetReminderRequest struct {
	MinutesBefore int `json:"minutesBefore"`
}
