import { useEffect } from 'react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { CalendarLayout } from '@/layout/CalendarLayout';
import { Sidebar } from '@/components/Sidebar';
import { CalendarHeader } from '@/components/CalendarHeader';
import { MonthView } from '@/components/MonthView';
import { WeekView } from '@/components/WeekView';
import { DayView } from '@/components/DayView';
import { EventDialog } from '@/components/EventDialog';
import { useCalendarStore } from '@/store/calendar';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { calendarApi } from '@/api/client';
import { MOCK_CALENDARS, MOCK_EVENTS } from '@/data/mock';
import { Toast } from '@haseen-me/ui';

export default function App() {
  const { viewMode, setCalendars, setEvents, setLoading } = useCalendarStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Initialize encryption keys
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Load calendars and events — try API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Fetch current month ± 1 month range
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();

    Promise.all([calendarApi.listCalendars(), calendarApi.listEvents({ start, end })])
      .then(([calData, evData]) => {
        if (!cancelled) {
          setCalendars(
            calData.calendars.map((c) => ({
              id: c.id,
              name: c.name,
              color: c.color,
              isDefault: c.isDefault,
              createdAt: c.createdAt,
            })),
          );
          setEvents(
            evData.events.map((e) => ({
              id: e.id,
              calendarId: e.calendarId ?? '',
              title: e.title,
              description: e.description,
              startTime: e.startTime,
              endTime: e.endTime,
              allDay: e.allDay,
              location: e.location ?? '',
              recurrenceRule: null,
              color: e.color,
              createdAt: e.createdAt ?? '',
              updatedAt: e.updatedAt ?? '',
            })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCalendars(MOCK_CALENDARS);
          setEvents(MOCK_EVENTS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [setCalendars, setEvents, setLoading]);

  const ViewComponent = viewMode === 'month' ? MonthView : viewMode === 'week' ? WeekView : DayView;

  return (
    <ErrorBoundary>
    <CalendarLayout>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CalendarHeader />
        <ViewComponent />
      </div>
      <EventDialog />
      <Toast message={toast.message} visible={toast.visible} onDismiss={toast.hide} />
    </CalendarLayout>
    </ErrorBoundary>
  );
}
