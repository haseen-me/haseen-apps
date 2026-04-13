import { useState, useRef, useEffect } from 'react';
import { useCalendarStore } from '@/store/calendar';
import { useToastStore } from '@haseen-me/shared/toast';
import { calendarApi } from '@/api/client';
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
  const { currentDate, events, visibleCalendarIds, openNewEvent, openEditEvent, setEvents } =
    useCalendarStore();
  const toast = useToastStore();
  const weekDates = getWeekDates(currentDate);
  const today = new Date();

  // Drag-to-create state
  const [dragStart, setDragStart] = useState<{ day: number; hour: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ day: number; hour: number } | null>(null);
  const isDragging = useRef(false);

  // Drag-to-reschedule state
  const rescheduleRef = useRef<{
    event: CalendarEvent;
    startY: number;
    origStartMins: number;
    durationMins: number;
    dayIndex: number;
  } | null>(null);
  const [rescheduleOffset, setRescheduleOffset] = useState<number>(0);
  const [rescheduleEventId, setRescheduleEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!rescheduleEventId) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!rescheduleRef.current) return;
      const dy = e.clientY - rescheduleRef.current.startY;
      setRescheduleOffset(dy);
    };
    const handleMouseUp = async () => {
      const info = rescheduleRef.current;
      if (!info) return;
      rescheduleRef.current = null;
      setRescheduleEventId(null);
      setRescheduleOffset(0);

      // Calculate new time from pixel offset
      const offsetMins = Math.round(rescheduleOffset / 48 * 60 / 15) * 15; // snap to 15min
      if (offsetMins === 0) return;

      const origStart = new Date(info.event.startTime);
      const origEnd = new Date(info.event.endTime);
      const newStart = new Date(origStart.getTime() + offsetMins * 60000);
      const newEnd = new Date(origEnd.getTime() + offsetMins * 60000);

      // Optimistic update
      setEvents(events.map((ev) =>
        ev.id === info.event.id
          ? { ...ev, startTime: newStart.toISOString(), endTime: newEnd.toISOString() }
          : ev,
      ));

      try {
        await calendarApi.updateEvent(info.event.id, {
          startTime: newStart.toISOString(),
          endTime: newEnd.toISOString(),
        });
      } catch {
        // Revert on failure
        setEvents(events.map((ev) =>
          ev.id === info.event.id
            ? { ...ev, startTime: info.event.startTime, endTime: info.event.endTime }
            : ev,
        ));
        toast.show('Failed to reschedule');
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [rescheduleEventId, rescheduleOffset, events, setEvents, toast]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Day headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '1px solid var(--hsn-border-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--hsn-text-tertiary)' }}>
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
              <div style={{ color: 'var(--hsn-text-tertiary)', fontWeight: 600, fontSize: 11 }}>
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
                  background: isToday ? 'var(--hsn-accent-teal)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--hsn-text-primary)',
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
                    color: 'var(--hsn-text-tertiary)',
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
                        borderBottom: '1px solid var(--hsn-border-primary)',
                        borderRight: di < 6 ? '1px solid var(--hsn-border-primary)' : undefined,
                        cursor: 'pointer',
                        background: isInDrag ? 'rgba(45,184,175,0.1)' : undefined,
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
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          rescheduleRef.current = {
                            event: evt,
                            startY: e.clientY,
                            origStartMins: startMins,
                            durationMins,
                            dayIndex: di,
                          };
                          setRescheduleEventId(evt.id);
                          setRescheduleOffset(0);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!rescheduleEventId) openEditEvent(evt);
                        }}
                        style={{
                          position: 'absolute',
                          top: rescheduleEventId === evt.id ? top + rescheduleOffset : top,
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
                          cursor: rescheduleEventId === evt.id ? 'grabbing' : 'grab',
                          pointerEvents: 'auto',
                          zIndex: rescheduleEventId === evt.id ? 10 : 1,
                          opacity: rescheduleEventId === evt.id ? 0.8 : 1,
                          transition: rescheduleEventId === evt.id ? 'none' : 'top 0.15s',
                        }}
                      >
                        <div style={{ fontWeight: 500, color: evt.color }}>{evt.title}</div>
                        {(evt.attendeeCount ?? 0) > 0 && height >= 32 && (
                          <div style={{ fontSize: 9, color: 'var(--hsn-text-tertiary)', marginTop: 1 }}>
                            {evt.attendeeCount} attendee{evt.attendeeCount !== 1 ? 's' : ''}
                          </div>
                        )}
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
