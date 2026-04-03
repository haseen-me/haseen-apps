import { useEffect } from 'react';
import { CalendarLayout } from '@/layout/CalendarLayout';
import { Sidebar } from '@/components/Sidebar';
import { CalendarHeader } from '@/components/CalendarHeader';
import { MonthView } from '@/components/MonthView';
import { WeekView } from '@/components/WeekView';
import { DayView } from '@/components/DayView';
import { EventDialog } from '@/components/EventDialog';
import { useCalendarStore } from '@/store/calendar';
import { MOCK_CALENDARS, MOCK_EVENTS } from '@/data/mock';

export default function App() {
  const { viewMode, setCalendars, setEvents } = useCalendarStore();

  useEffect(() => {
    setCalendars(MOCK_CALENDARS);
    setEvents(MOCK_EVENTS);
  }, [setCalendars, setEvents]);

  const ViewComponent = viewMode === 'month' ? MonthView : viewMode === 'week' ? WeekView : DayView;

  return (
    <CalendarLayout>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CalendarHeader />
        <ViewComponent />
      </div>
      <EventDialog />
    </CalendarLayout>
  );
}
