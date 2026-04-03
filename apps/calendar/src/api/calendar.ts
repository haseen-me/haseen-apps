const BASE = '/api/v1';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || res.statusText);
  }
  return res.json() as Promise<T>;
}

import type { Calendar, CalendarEvent, Attendee, Reminder } from '@/types/calendar';

export const api = {
  // Calendars
  listCalendars: () => request<{ calendars: Calendar[] }>('/calendar/calendars'),

  createCalendar: (data: { name: string; color: string }) =>
    request<Calendar>('/calendar/calendars', { method: 'POST', body: JSON.stringify(data) }),

  updateCalendar: (id: string, data: { name?: string; color?: string }) =>
    request<Calendar>(`/calendar/calendars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCalendar: (id: string) =>
    request<{ ok: boolean }>(`/calendar/calendars/${id}`, { method: 'DELETE' }),

  // Events
  listEvents: (params: { start: string; end: string; calendarId?: string }) => {
    const qs = new URLSearchParams({ start: params.start, end: params.end });
    if (params.calendarId) qs.set('calendarId', params.calendarId);
    return request<{ events: CalendarEvent[] }>(`/calendar/events?${qs}`);
  },

  getEvent: (id: string) => request<CalendarEvent>(`/calendar/events/${id}`),

  createEvent: (data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) =>
    request<CalendarEvent>('/calendar/events', { method: 'POST', body: JSON.stringify(data) }),

  updateEvent: (id: string, data: Partial<CalendarEvent>) =>
    request<CalendarEvent>(`/calendar/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteEvent: (id: string) =>
    request<{ ok: boolean }>(`/calendar/events/${id}`, { method: 'DELETE' }),

  // Attendees
  getAttendees: (eventId: string) =>
    request<{ attendees: Attendee[] }>(`/calendar/events/${eventId}/attendees`),

  addAttendee: (eventId: string, email: string) =>
    request<Attendee>(`/calendar/events/${eventId}/attendees`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  removeAttendee: (eventId: string, attendeeId: string) =>
    request<{ ok: boolean }>(`/calendar/events/${eventId}/attendees/${attendeeId}`, {
      method: 'DELETE',
    }),

  // Reminders
  getReminders: (eventId: string) =>
    request<{ reminders: Reminder[] }>(`/calendar/events/${eventId}/reminders`),

  setReminder: (eventId: string, minutesBefore: number) =>
    request<Reminder>(`/calendar/events/${eventId}/reminders`, {
      method: 'POST',
      body: JSON.stringify({ minutesBefore }),
    }),

  deleteReminder: (eventId: string, reminderId: string) =>
    request<{ ok: boolean }>(`/calendar/events/${eventId}/reminders/${reminderId}`, {
      method: 'DELETE',
    }),
};
