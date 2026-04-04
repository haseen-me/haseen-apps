import { useState, useRef } from 'react';
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

  // Drag-to-create state
  const [dragStartHour, setDragStartHour] = useState<number | null>(null);
  const [dragEndHour, setDragEndHour] = useState<number | null>(null);
  const isDragging = useRef(false);

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
        <div style={{ position: 'relative' }}>
          {/* Grid lines + click targets */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr' }}>
            {HOURS.map((h) => (
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    isDragging.current = true;
                    setDragStartHour(h);
                    setDragEndHour(h);
                  }}
                  onMouseEnter={() => {
                    if (isDragging.current) {
                      setDragEndHour(h);
                    }
                  }}
                  onMouseUp={() => {
                    if (isDragging.current && dragStartHour !== null) {
                      isDragging.current = false;
                      const endH = dragEndHour ?? h;
                      const minH = Math.min(dragStartHour, endH);
                      const maxH = Math.max(dragStartHour, endH);
                      const startDate = new Date(currentDate);
                      startDate.setHours(minH, 0, 0, 0);
                      const endDate = new Date(currentDate);
                      endDate.setHours(maxH + 1, 0, 0, 0);
                      setDragStartHour(null);
                      setDragEndHour(null);
                      if (minH === maxH) {
                        openNewEvent(startDate);
                      } else {
                        openNewEvent(startDate, endDate);
                      }
                    }
                  }}
                  style={{
                    height: 60,
                    borderBottom: '1px solid var(--cal-border-subtle)',
                    cursor: 'pointer',
                    background:
                      dragStartHour !== null &&
                      dragEndHour !== null &&
                      h >= Math.min(dragStartHour, dragEndHour) &&
                      h <= Math.max(dragStartHour, dragEndHour)
                        ? 'var(--cal-brand-subtle, rgba(66,133,244,0.15))'
                        : undefined,
                    transition: 'background 0.05s',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Events overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 60,
              right: 0,
              height: 24 * 60,
              pointerEvents: 'none',
            }}
          >
            {dayEvents
              .filter((e) => !e.allDay)
              .map((evt) => {
                const start = new Date(evt.startTime);
                const end = new Date(evt.endTime);
                const dayStart = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  currentDate.getDate(),
                );
                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayEnd.getDate() + 1);
                const clampedStart = start < dayStart ? dayStart : start;
                const clampedEnd = end > dayEnd ? dayEnd : end;
                const startMins = (clampedStart.getTime() - dayStart.getTime()) / 60000;
                const durationMins = (clampedEnd.getTime() - clampedStart.getTime()) / 60000;
                const top = (startMins / 60) * 60;
                const height = Math.max((durationMins / 60) * 60, 24);

                return (
                  <div
                    key={evt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditEvent(evt);
                    }}
                    style={{
                      position: 'absolute',
                      top,
                      left: 4,
                      right: 4,
                      height,
                      background: evt.color + '20',
                      borderLeft: `3px solid ${evt.color}`,
                      borderRadius: 4,
                      padding: '4px 8px',
                      fontSize: 12,
                      cursor: 'pointer',
                      pointerEvents: 'auto',
                      zIndex: 1,
                    }}
                  >
                    <div style={{ fontWeight: 500, color: evt.color }}>{evt.title}</div>
                    {evt.location && (
                      <div style={{ fontSize: 10, color: 'var(--cal-text-muted)' }}>
                        {evt.location}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
