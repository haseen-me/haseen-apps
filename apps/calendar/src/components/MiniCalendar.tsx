import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function MiniCalendar() {
  const { currentDate, setCurrentDate } = useCalendarStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div style={{ padding: '4px 16px 12px', borderBottom: '1px solid var(--hsn-border-primary)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <button
          onClick={prevMonth}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            color: 'var(--hsn-text-secondary)',
          }}
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          {MONTHS[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            padding: 4,
            color: 'var(--hsn-text-secondary)',
          }}
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 0,
          textAlign: 'center',
          fontSize: 11,
        }}
      >
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} style={{ color: 'var(--hsn-text-tertiary)', padding: 2, fontWeight: 600 }}>
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          const isToday =
            day !== null &&
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const isSelected =
            day !== null && day === currentDate.getDate();
          return (
            <button
              key={i}
              onClick={() => {
                if (day) {
                  const d = new Date(year, month, day);
                  setCurrentDate(d);
                }
              }}
              disabled={day === null}
              style={{
                width: 24,
                height: 24,
                margin: '1px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                borderRadius: '50%',
                fontSize: 11,
                background: isToday
                  ? 'var(--hsn-accent-teal)'
                  : isSelected
                    ? 'rgba(45,184,175,0.1)'
                    : 'transparent',
                color: isToday
                  ? '#fff'
                  : day === null
                    ? 'transparent'
                    : 'var(--hsn-text-primary)',
                fontWeight: isToday ? 600 : 400,
                cursor: day !== null ? 'pointer' : 'default',
              }}
            >
              {day ?? ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
