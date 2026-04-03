import type { ReactNode } from 'react';
import { ProductRail } from '@/components/ProductRail';

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
      <ProductRail activeProduct="calendar" />
      {children}
    </div>
  );
}
