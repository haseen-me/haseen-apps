-- Calendar tables for encrypted calendar service

CREATE TABLE IF NOT EXISTS calendars (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color       TEXT NOT NULL DEFAULT '#2db8af',
    is_default  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendars_owner ON calendars(owner_id);

CREATE TABLE IF NOT EXISTS events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    calendar_id     UUID NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    all_day         BOOLEAN NOT NULL DEFAULT FALSE,
    location        TEXT NOT NULL DEFAULT '',
    recurrence_rule TEXT,
    color           TEXT NOT NULL DEFAULT '#2db8af',
    encrypted_data  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_calendar ON events(calendar_id);
CREATE INDEX idx_events_owner ON events(owner_id);
CREATE INDEX idx_events_time ON events(start_time, end_time);

CREATE TABLE IF NOT EXISTS event_attendees (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    email    TEXT NOT NULL,
    status   TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    UNIQUE(event_id, email)
);

CREATE INDEX idx_attendees_event ON event_attendees(event_id);

CREATE TABLE IF NOT EXISTS reminders (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    minutes_before INT NOT NULL,
    UNIQUE(event_id, minutes_before)
);

CREATE INDEX idx_reminders_event ON reminders(event_id);
