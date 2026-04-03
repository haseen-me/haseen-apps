import type { ReactNode } from 'react';
import { ProductRail } from '@/components/ProductRail';
import { Sidebar } from './Sidebar';

export function DriveLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ProductRail activeProduct="drive" />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
