import { useState, useRef } from 'react';
import { useCalendarStore } from '@/store/calendar';
import type { CalendarEvent } from '@/types/calendar';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekDates(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function WeekView() {
  const { currentDate, events, visibleCalendarIds, openNewEvent, openEditEvent } =
    useCalendarStore();
  const weekDates = getWeekDates(currentDate);
  const today = new Date();

  // Drag-to-create state
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const isDragging = useRef(false);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '1px solid var(--cal-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--cal-text-muted)' }}>
          W{getISOWeekNumber(weekDates[0]!)}
        </div>
        {weekDates.map((date, i) => {
          const isToday = isSameDay(date, today);
          return (
            <div
              key={i}
              style={{
                padding: '8px 4px',
                textAlign: 'center',
                fontSize: 12,
              }}
            >
              <div style={{ color: 'var(--cal-text-muted)', fontWeight: 600, fontSize: 11 }}>
                {DAYS[i]}
              </div>
              <div
                style={{
                  width: 28,
                  height: 28,
                  margin: '2px auto 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: isToday ? 'var(--cal-brand)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--cal-text)',
                  fontWeight: isToday ? 600 : 400,
                  fontSize: 14,
                }}
              >
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative' }}>
          {/* Grid lines + click targets */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px repeat(7, 1fr)',
            }}
          >
            {HOURS.map((h) => (
              <div key={h} style={{ display: 'contents' }}>
                <div
                  style={{
                    padding: '0 8px',
                    height: 48,
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
                {weekDates.map((_date, di) => {
                  const isInDrag =
                    dragStart &&
                    dragEnd &&
                    di === dragStart.day &&
                    di === dragEnd.day &&
                    h >= Math.min(dragStart.hour, dragEnd.hour) &&
                    h <= Math.max(dragStart.hour, dragEnd.hour);
                  return (
                    <div
                      key={di}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        isDragging.current = true;
                        setDragStart({ day: di, hour: h });
                        setDragEnd({ day: di, hour: h });
                      }}
                      onMouseEnter={() => {
                        if (isDragging.current && dragStart && dragStart.day === di) {
                          setDragEnd({ day: di, hour: h });
                        }
                      }}
                      onMouseUp={() => {
                        if (isDragging.current && dragStart) {
                          isDragging.current = false;
                          const endH = dragEnd ? dragEnd.hour : h;
                          const minH = Math.min(dragStart.hour, endH);
                          const maxH = Math.max(dragStart.hour, endH);
                          const startDate = new Date(weekDates[dragStart.day]!);
                          startDate.setHours(minH, 0, 0, 0);
                          const endDate = new Date(weekDates[dragStart.day]!);
                          endDate.setHours(maxH + 1, 0, 0, 0);
                          setDragStart(null);
                          setDragEnd(null);
                          if (minH === maxH) {
                            openNewEvent(startDate);
                          } else {
                            openNewEvent(startDate, endDate);
                          }
                        }
                      }}
                      style={{
                        height: 48,
                        borderBottom: '1px solid var(--cal-border-subtle)',
                        borderRight: di < 6 ? '1px solid var(--cal-border-subtle)' : undefined,
                        cursor: 'pointer',
                        background: isInDrag ? 'var(--cal-brand-subtle, rgba(66,133,244,0.15))' : undefined,
                        transition: 'background 0.05s',
                      }}
                    />
                  );
                })}
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
              height: 24 * 48,
              pointerEvents: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}
          >
            {weekDates.map((date, di) => {
              const dayEvts = eventsForDay(events, date, visibleCalendarIds).filter(
                (e) => !e.allDay,
              );
              return (
                <div key={di} style={{ position: 'relative' }}>
                  {dayEvts.map((evt) => {
                    const start = new Date(evt.startTime);
                    const end = new Date(evt.endTime);
                    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);
                    const clampedStart = start < dayStart ? dayStart : start;
                    const clampedEnd = end > dayEnd ? dayEnd : end;
                    const startMins = (clampedStart.getTime() - dayStart.getTime()) / 60000;
                    const durationMins = (clampedEnd.getTime() - clampedStart.getTime()) / 60000;
                    const top = (startMins / 60) * 48;
                    const height = Math.max((durationMins / 60) * 48, 20);

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
                          left: 2,
                          right: 2,
                          height,
                          background: evt.color + '20',
                          borderLeft: `3px solid ${evt.color}`,
                          borderRadius: 4,
                          padding: '2px 4px',
                          fontSize: 11,
                          lineHeight: '14px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          zIndex: 1,
                        }}
                      >
                        <div style={{ fontWeight: 500, color: evt.color }}>{evt.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
