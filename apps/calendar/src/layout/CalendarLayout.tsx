import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';
import { Menu } from 'lucide-react';
import { ProductRail } from '@/components/ProductRail';

const MobileSidebarCtx = createContext(false);
const MobileSidebarToggleCtx = createContext<() => void>(() => {});
export const useMobileSidebar = () => ({
  open: useContext(MobileSidebarCtx),
  toggle: useContext(MobileSidebarToggleCtx),
});

export function CalendarLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <MobileSidebarCtx.Provider value={mobileSidebarOpen}>
    <MobileSidebarToggleCtx.Provider value={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--cal-bg)',
      }}
    >
      <div className="cal-product-rail">
        <ProductRail activeProduct="calendar" />
      </div>
      {/* Mobile header */}
      <div
        className="cal-mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'var(--cal-bg)',
          borderBottom: '1px solid var(--cal-border)',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          zIndex: 250,
        }}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--cal-text)', padding: 4, display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Calendar</span>
      </div>
      <div
        className={`cal-sidebar-backdrop${mobileSidebarOpen ? ' mobile-open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      {children}
    </div>
    </MobileSidebarToggleCtx.Provider>
    </MobileSidebarCtx.Provider>
  );
}
