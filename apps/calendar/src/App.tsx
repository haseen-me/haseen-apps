import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { requireAuth } from '@haseen-me/shared';
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
import { decryptSymmetric } from '@haseen-me/crypto';
import { Toast } from '@haseen-me/ui';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const { viewMode, setCalendars, setEvents, setLoading } = useCalendarStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const encryptionKeyPair = useCryptoStore((s) => s.encryptionKeyPair);
  const toast = useToastStore();

  // Decrypt an `enc:nonce:ciphertext` field
  function decryptField(value: string): string {
    if (!value || !value.startsWith('enc:') || !encryptionKeyPair) return value;
    try {
      const parts = value.split(':');
      if (parts.length !== 3) return value;
      const key = encryptionKeyPair.secretKey.slice(0, 32);
      const fromHex = (h: string) => {
        const b = new Uint8Array(h.length / 2);
        for (let i = 0; i < h.length; i += 2) b[i / 2] = parseInt(h.substring(i, i + 2), 16);
        return b;
      };
      const nonce = fromHex(parts[1]!);
      const ciphertext = fromHex(parts[2]!);
      const plaintext = decryptSymmetric({ ciphertext, nonce }, key);
      return new TextDecoder().decode(plaintext);
    } catch {
      return value;
    }
  }

  // Check auth on mount
  useEffect(() => {
    if (requireAuth()) setAuthed(true);
  }, []);

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
              title: decryptField(e.title),
              description: decryptField(e.description),
              startTime: e.startTime,
              endTime: e.endTime,
              allDay: e.allDay,
              location: decryptField(e.location ?? ''),
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

  if (!authed) return null;

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
