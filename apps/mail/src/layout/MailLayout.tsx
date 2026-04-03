import type { ReactNode } from 'react';
import { ProductRail } from '@/components/ProductRail';
import { Sidebar } from './Sidebar';

export function MailLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ProductRail activeProduct="mail" />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
