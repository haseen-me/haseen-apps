import { Calendar as CalIcon, Eye, EyeOff, Plus } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar';
import { MiniCalendar } from '@/components/MiniCalendar';

export function Sidebar() {
  const { calendars, visibleCalendarIds, toggleCalendarVisibility, openNewEvent } =
    useCalendarStore();

  return (
    <aside
      style={{
        width: 'var(--cal-sidebar-width)',
        borderRight: '1px solid var(--cal-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--cal-bg)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 'var(--cal-header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 8,
          borderBottom: '1px solid var(--cal-border)',
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        <CalIcon size={20} color="var(--cal-brand)" />
        Haseen Calendar
      </div>

      {/* New event button */}
      <div style={{ padding: '12px 16px' }}>
        <button
          onClick={() => openNewEvent(new Date())}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 12px',
            background: 'var(--cal-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--cal-radius-sm)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Plus size={16} /> New Event
        </button>
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
            color: 'var(--cal-text-muted)',
            marginBottom: 8,
          }}
        >
          My calendars
        </div>
        {calendars.map((cal) => {
          const visible = visibleCalendarIds.has(cal.id);
          return (
            <button
              key={cal.id}
              onClick={() => toggleCalendarVisibility(cal.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '6px 8px',
                border: 'none',
                borderRadius: 'var(--cal-radius-sm)',
                background: 'transparent',
                fontSize: 13,
                color: visible ? 'var(--cal-text)' : 'var(--cal-text-muted)',
                textAlign: 'left',
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
              {cal.name}
              <span style={{ marginLeft: 'auto', opacity: 0.4 }}>
                {visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
