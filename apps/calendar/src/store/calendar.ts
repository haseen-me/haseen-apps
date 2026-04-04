import { create } from 'zustand';
import type { Calendar, CalendarEvent, ViewMode } from '@/types/calendar';

interface CalendarState {
  // View
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  goToday: () => void;
  goPrev: () => void;
  goNext: () => void;

  // Calendars
  calendars: Calendar[];
  setCalendars: (c: Calendar[]) => void;
  visibleCalendarIds: Set<string>;
  toggleCalendarVisibility: (id: string) => void;

  // Events
  events: CalendarEvent[];
  setEvents: (e: CalendarEvent[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;

  // Event dialog
  eventDialogOpen: boolean;
  editingEvent: CalendarEvent | null;
  selectedDate: Date | null;
  selectedEndDate: Date | null;
  openNewEvent: (date: Date, endDate?: Date) => void;
  openEditEvent: (event: CalendarEvent) => void;
  closeEventDialog: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewMode: 'month',
  setViewMode: (viewMode) => set({ viewMode }),
  currentDate: new Date(),
  setCurrentDate: (currentDate) => set({ currentDate }),
  goToday: () => set({ currentDate: new Date() }),
  goPrev: () => {
    const { currentDate, viewMode } = get();
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    set({ currentDate: d });
  },
  goNext: () => {
    const { currentDate, viewMode } = get();
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    set({ currentDate: d });
  },

  calendars: [],
  setCalendars: (calendars) => set({ calendars, visibleCalendarIds: new Set(calendars.map((c) => c.id)) }),
  visibleCalendarIds: new Set<string>(),
  toggleCalendarVisibility: (id) => {
    const next = new Set(get().visibleCalendarIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ visibleCalendarIds: next });
  },

  events: [],
  setEvents: (events) => set({ events }),
  loading: false,
  setLoading: (loading) => set({ loading }),

  eventDialogOpen: false,
  editingEvent: null,
  selectedDate: null,
  selectedEndDate: null,
  openNewEvent: (date, endDate) => set({ eventDialogOpen: true, editingEvent: null, selectedDate: date, selectedEndDate: endDate ?? null }),
  openEditEvent: (event) => set({ eventDialogOpen: true, editingEvent: event, selectedDate: null, selectedEndDate: null }),
  closeEventDialog: () => set({ eventDialogOpen: false, editingEvent: null, selectedDate: null, selectedEndDate: null }),
}));
