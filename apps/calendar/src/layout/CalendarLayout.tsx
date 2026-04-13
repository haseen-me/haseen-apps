import type { ReactNode } from 'react';
import { useState, createContext, useContext } from 'react';
import { Menu } from 'lucide-react';
import { AppShell, AppShellMain, IconButton, Type, Size } from '@haseen-me/ui';
import { ProductRail } from '@haseen-me/shared/ProductRail';

const RAIL_WIDTH = 48;

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
    <AppShell
      sidebar={
        <div className="cal-product-rail" style={{ width: RAIL_WIDTH, height: '100%' }}>
          <ProductRail activeProduct="calendar" />
        </div>
      }
      sidebarWidth={RAIL_WIDTH}
    >
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
          background: 'var(--hsn-bg-header)',
          borderBottom: '1px solid var(--hsn-border-primary)',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          zIndex: 250,
        }}
      >
        <IconButton
          icon={<Menu size={20} />}
          onClick={() => setMobileSidebarOpen(true)}
          type={Type.TERTIARY}
          size={Size.SMALL}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--hsn-text-primary)' }}>Calendar</span>
      </div>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--hsn-bg-overlay)',
            zIndex: 199,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <AppShellMain noPadding style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          {children}
        </div>
      </AppShellMain>
    </AppShell>
    </MobileSidebarToggleCtx.Provider>
    </MobileSidebarCtx.Provider>
  );
}
