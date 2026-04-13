import { useState } from 'react';
import { Calendar as CalIcon, Plus } from 'lucide-react';
import { Button, IconButton, Toggle, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';
import { useCalendarStore } from '@/store/calendar';
import { MiniCalendar } from '@/components/MiniCalendar';
import { AddCalendarDialog } from '@/components/AddCalendarDialog';
import { useMobileSidebar } from '@/layout/CalendarLayout';

export function Sidebar() {
  const { calendars, visibleCalendarIds, toggleCalendarVisibility, openNewEvent } =
    useCalendarStore();
  const [showAddCalendar, setShowAddCalendar] = useState(false);
  const { open: mobileSidebarOpen } = useMobileSidebar();

  return (
    <aside
      className={`cal-sidebar${mobileSidebarOpen ? ' mobile-open' : ''}`}
      style={{
        width: 'var(--cal-sidebar-width, 260px)',
        borderRight: '1px solid var(--hsn-border-primary)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--hsn-bg-sidepanel)',
        flexShrink: 0,
        height: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 'var(--cal-header-height, 52px)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
          borderBottom: '1px solid var(--hsn-border-primary)',
        }}
      >
        <CalIcon size={18} style={{ color: 'var(--hsn-accent-teal)' }} />
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Calendar</Typography>
      </div>

      {/* New event button */}
      <div style={{ padding: '12px 16px' }}>
        <Button
          type={Type.PRIMARY}
          size={Size.MEDIUM}
          fullWidth
          onClick={() => openNewEvent(new Date())}
          startIcon={<Plus size={16} />}
        >
          New Event
        </Button>
      </div>

      {/* Mini calendar */}
      <MiniCalendar />

      {/* Calendar list */}
      <div style={{ padding: '12px 16px', flex: 1, overflow: 'auto' }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--hsn-text-tertiary)',
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          My calendars
          <IconButton
            icon={<Plus size={14} />}
            onClick={() => setShowAddCalendar(true)}
            type={Type.TERTIARY}
            size={Size.SMALL}
            tooltip="Add calendar"
          />
        </div>
        {calendars.map((cal) => {
          const visible = visibleCalendarIds.has(cal.id);
          return (
            <div
              key={cal.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 4px',
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: visible ? cal.color : 'transparent',
                  border: visible ? 'none' : `2px solid ${cal.color}`,
                  flexShrink: 0,
                }}
              />
              <Typography
                size={TypographySize.BODY}
                style={{ flex: 1, color: visible ? 'var(--hsn-text-primary)' : 'var(--hsn-text-tertiary)' }}
              >
                {cal.name}
              </Typography>
              <Toggle
                checked={visible}
                onChange={() => toggleCalendarVisibility(cal.id)}
              />
            </div>
          );
        })}
      </div>
      <AddCalendarDialog open={showAddCalendar} onClose={() => setShowAddCalendar(false)} />
    </aside>
  );
}
