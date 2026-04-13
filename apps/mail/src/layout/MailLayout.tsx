import type { ReactNode } from 'react';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { AppShell, AppShellMain, IconButton, Type, Size } from '@haseen-me/ui';
import { ProductRail } from '@haseen-me/shared/ProductRail';
import { Sidebar } from './Sidebar';
import { useMailStore } from '@/store/mail';

const RAIL_WIDTH = 48;
const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

export function MailLayout({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarCollapsed = useMailStore((s) => s.sidebarCollapsed);

  const totalSidebarWidth = RAIL_WIDTH + (sidebarCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);

  return (
    <AppShell
      sidebar={
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          <div className="mail-product-rail" style={{ width: RAIL_WIDTH, flexShrink: 0 }}>
            <ProductRail activeProduct="mail" />
          </div>
          <Sidebar mobileSidebarOpen={mobileSidebarOpen} />
        </div>
      }
      sidebarWidth={totalSidebarWidth}
    >
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
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--hsn-text-primary)' }}>Mail</span>
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
        {children}
      </AppShellMain>
    </AppShell>
  );
}
