import type { ReactNode } from 'react';

export function CalendarLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--cal-bg)',
      }}
    >
      {children}
    </div>
  );
}
