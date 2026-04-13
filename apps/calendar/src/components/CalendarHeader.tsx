import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, IconButton, Tabs, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';
import type { Tab } from '@haseen-me/ui';
import { useCalendarStore } from '@/store/calendar';
import type { ViewMode } from '@/types/calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const VIEW_TABS: Tab[] = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
];

function formatTitle(date: Date, mode: ViewMode): string {
  if (mode === 'month') return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  if (mode === 'day') return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
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
        height: 'var(--cal-header-height, 52px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid var(--hsn-border-primary)',
        gap: 8,
        flexShrink: 0,
        background: 'var(--hsn-bg-l1-solid)',
      }}
    >
      <Button type={Type.SECONDARY} size={Size.SMALL} onClick={goToday}>Today</Button>
      <IconButton icon={<ChevronLeft size={18} />} type={Type.TERTIARY} size={Size.SMALL} onClick={goPrev} tooltip="Previous" />
      <IconButton icon={<ChevronRight size={18} />} type={Type.TERTIARY} size={Size.SMALL} onClick={goNext} tooltip="Next" />

      <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ minWidth: 200, paddingLeft: 4 }}>
        {formatTitle(currentDate, viewMode)}
      </Typography>

      <div style={{ flex: 1 }} />

      <Tabs tabs={VIEW_TABS} activeTab={viewMode} onTabChange={(t) => setViewMode(t as ViewMode)} />
    </header>
  );
}
