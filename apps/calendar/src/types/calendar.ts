export interface Calendar {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  recurrenceRule: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
  attendeeCount?: number;
}

export interface Attendee {
  id: string;
  eventId: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Reminder {
  id: string;
  eventId: string;
  minutesBefore: number;
}

export type ViewMode = 'month' | 'week' | 'day';

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export const CALENDAR_COLORS = [
  '#2db8af',
  '#3e63dd',
  '#e54666',
  '#f76b15',
  '#8e4ec6',
  '#30a46c',
  '#e5484d',
  '#978365',
] as const;
