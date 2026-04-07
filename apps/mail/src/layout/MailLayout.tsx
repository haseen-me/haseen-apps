import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { ProductRail } from '@/components/ProductRail';
import { Sidebar } from './Sidebar';

export function MailLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className="mail-product-rail">
        <ProductRail activeProduct="mail" />
      </div>
      {/* Mobile header */}
      <div
        className="mail-mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'var(--mail-bg)',
          borderBottom: '1px solid var(--mail-border)',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          zIndex: 250,
        }}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--mail-text)', padding: 4, display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Mail</span>
      </div>
      {/* Mobile sidebar backdrop */}
      <div
        className={`mail-sidebar-backdrop${mobileSidebarOpen ? ' mobile-open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <Sidebar mobileSidebarOpen={mobileSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
