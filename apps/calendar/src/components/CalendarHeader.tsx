import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar';
import type { ViewMode } from '@/types/calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const VIEW_LABELS: Record<ViewMode, string> = { month: 'Month', week: 'Week', day: 'Day' };

function formatTitle(date: Date, mode: ViewMode): string {
  if (mode === 'month') return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  if (mode === 'day') {
    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }
  // week
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    return `${MONTHS[start.getMonth()]} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${MONTHS[start.getMonth()]} ${start.getDate()} – ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

export function CalendarHeader() {
  const { viewMode, setViewMode, currentDate, goToday, goPrev, goNext } = useCalendarStore();

  return (
    <header
      style={{
        height: 'var(--cal-header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--cal-border)',
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Navigation */}
      <button
        onClick={goToday}
        style={{
          padding: '5px 14px',
          border: '1px solid var(--cal-border)',
          borderRadius: 'var(--cal-radius-sm)',
          background: 'var(--cal-bg)',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--cal-text)',
        }}
      >
        Today
      </button>
      <button
        onClick={goPrev}
        style={{
          background: 'none',
          border: 'none',
          padding: 4,
          color: 'var(--cal-text-secondary)',
        }}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={goNext}
        style={{
          background: 'none',
          border: 'none',
          padding: 4,
          color: 'var(--cal-text-secondary)',
        }}
      >
        <ChevronRight size={18} />
      </button>

      <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, minWidth: 200 }}>
        {formatTitle(currentDate, viewMode)}
      </h2>

      <div style={{ flex: 1 }} />

      {/* View toggle */}
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--cal-border)',
          borderRadius: 'var(--cal-radius-sm)',
          overflow: 'hidden',
        }}
      >
        {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '5px 14px',
              border: 'none',
              background: viewMode === mode ? 'var(--cal-brand)' : 'var(--cal-bg)',
              color: viewMode === mode ? '#fff' : 'var(--cal-text-secondary)',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {VIEW_LABELS[mode]}
          </button>
        ))}
      </div>
    </header>
  );
}
