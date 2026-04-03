import { useCalendarStore } from '@/store/calendar';
import type { CalendarEvent } from '@/types/calendar';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMonthGrid(date: Date): Date[][] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: Date[][] = [];
  let row: Date[] = [];

  // Fill leading days from prev month
  const prevDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    row.push(new Date(year, month - 1, prevDays - i));
  }

  for (let d = 1; d <= daysInMonth; d++) {
    row.push(new Date(year, month, d));
    if (row.length === 7) {
      grid.push(row);
      row = [];
    }
  }

  // Fill trailing days
  if (row.length > 0) {
    let next = 1;
    while (row.length < 7) {
      row.push(new Date(year, month + 1, next++));
    }
    grid.push(row);
  }

  return grid;
}

function eventsForDay(events: CalendarEvent[], date: Date, visibleIds: Set<string>): CalendarEvent[] {
  const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return events.filter((e) => {
    if (!visibleIds.has(e.calendarId)) return false;
    const eStart = new Date(e.startTime);
    const eEnd = new Date(e.endTime);
    return eStart < dayEnd && eEnd > dayStart;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MonthView() {
  const { currentDate, events, visibleCalendarIds, openNewEvent, openEditEvent } =
    useCalendarStore();
  const grid = getMonthGrid(currentDate);
  const today = new Date();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--cal-border)' }}>
        {DAYS.map((d) => (
          <div
            key={d}
            style={{
              padding: '8px 10px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--cal-text-muted)',
              textAlign: 'center',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {grid.map((week, wi) => (
          <div
            key={wi}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              flex: 1,
              minHeight: 0,
            }}
          >
            {week.map((date, di) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(date, today);
              const dayEvents = eventsForDay(events, date, visibleCalendarIds);

              return (
                <div
                  key={di}
                  onClick={() => openNewEvent(date)}
                  style={{
                    borderRight: di < 6 ? '1px solid var(--cal-border-subtle)' : undefined,
                    borderBottom: '1px solid var(--cal-border-subtle)',
                    padding: 4,
                    cursor: 'pointer',
                    background: isToday ? 'var(--cal-brand-subtle)' : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontSize: 12,
                        fontWeight: isToday ? 600 : 400,
                        background: isToday ? 'var(--cal-brand)' : 'transparent',
                        color: isToday ? '#fff' : 'var(--cal-text)',
                      }}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEvent(evt);
                      }}
                      style={{
                        padding: '1px 4px',
                        marginBottom: 1,
                        borderRadius: 3,
                        fontSize: 11,
                        lineHeight: '16px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        background: evt.color + '20',
                        color: evt.color,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: 10, color: 'var(--cal-text-muted)', textAlign: 'center' }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
