import { useCalendarStore } from '@/store/calendar';
import type { CalendarEvent } from '@/types/calendar';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function eventsForDay(
  events: CalendarEvent[],
  date: Date,
  visibleIds: Set<string>,
): CalendarEvent[] {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return events.filter((e) => {
    if (!visibleIds.has(e.calendarId)) return false;
    const s = new Date(e.startTime);
    const en = new Date(e.endTime);
    return s < dayEnd && en > dayStart;
  });
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function DayView() {
  const { currentDate, events, visibleCalendarIds, openNewEvent, openEditEvent } =
    useCalendarStore();

  const dayEvents = eventsForDay(events, currentDate, visibleCalendarIds);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--cal-border)',
          fontSize: 13,
          color: 'var(--cal-text-secondary)',
        }}
      >
        {DAYS[currentDate.getDay()]}, {MONTHS[currentDate.getMonth()]} {currentDate.getDate()}
      </div>

      {/* All-day events */}
      {dayEvents.filter((e) => e.allDay).length > 0 && (
        <div
          style={{
            padding: '6px 20px 6px 80px',
            borderBottom: '1px solid var(--cal-border)',
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          {dayEvents
            .filter((e) => e.allDay)
            .map((evt) => (
              <div
                key={evt.id}
                onClick={() => openEditEvent(evt)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  background: evt.color + '20',
                  color: evt.color,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {evt.title}
              </div>
            ))}
        </div>
      )}

      {/* Time grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', position: 'relative' }}>
          {HOURS.map((h) => {
            const hourEvents = dayEvents.filter((e) => {
              if (e.allDay) return false;
              return new Date(e.startTime).getHours() === h;
            });

            return (
              <div key={h} style={{ display: 'contents' }}>
                <div
                  style={{
                    padding: '0 8px',
                    height: 60,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-end',
                    fontSize: 10,
                    color: 'var(--cal-text-muted)',
                    transform: 'translateY(-6px)',
                  }}
                >
                  {h > 0 ? formatHour(h) : ''}
                </div>
                <div
                  onClick={() => {
                    const d = new Date(currentDate);
                    d.setHours(h, 0, 0, 0);
                    openNewEvent(d);
                  }}
                  style={{
                    height: 60,
                    borderBottom: '1px solid var(--cal-border-subtle)',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  {hourEvents.map((evt) => {
                    const start = new Date(evt.startTime);
                    const end = new Date(evt.endTime);
                    const durationHours = (end.getTime() - start.getTime()) / 3600000;
                    const topOffset = (start.getMinutes() / 60) * 60;
                    return (
                      <div
                        key={evt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEvent(evt);
                        }}
                        style={{
                          position: 'absolute',
                          top: topOffset,
                          left: 4,
                          right: 4,
                          height: Math.max(durationHours * 60, 24),
                          background: evt.color + '20',
                          borderLeft: `3px solid ${evt.color}`,
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: 12,
                          cursor: 'pointer',
                          zIndex: 1,
                        }}
                      >
                        <div style={{ fontWeight: 500, color: evt.color }}>{evt.title}</div>
                        {!evt.allDay && (
                          <div style={{ fontSize: 10, color: 'var(--cal-text-muted)' }}>
                            {evt.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
