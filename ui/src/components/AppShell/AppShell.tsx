/**
 * AppShell — Enterprise-density, native-app-like web view layout
 *
 * Structural contract:
 * - The entire shell is viewport-locked (100dvh). Nothing scrolls at the root level.
 * - Each pane has its own scrollable inner area.
 * - Separation is achieved exclusively with 1px borders, not shadows.
 * - No gradients, no glassmorphism: all backgrounds are solid tokens.
 *
 * Layout anatomy:
 * ┌───────────────────────────────────────────────────────┐
 * │  Header (fixed height, full-width)                    │
 * ├──────────┬────────────────────────┬───────────────────┤
 * │ Sidebar  │  Main content (scroll) │  Detail pane      │
 * │ (fixed)  │                        │  (optional/fixed) │
 * └──────────┴────────────────────────┴───────────────────┘
 */

import React, { CSSProperties } from 'react';

import { zIndex } from '../../tokens';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AppShellProps {
  /** Fixed-height top bar: logo, global nav, user menu */
  header?: React.ReactNode;
  /** Fixed-width left navigation rail */
  sidebar?: React.ReactNode;
  /** Scrollable main content area */
  children: React.ReactNode;
  /** Optional fixed-width detail/preview pane on the right */
  detailPane?: React.ReactNode;
  /** Sidebar width in px (default: 240) */
  sidebarWidth?: number;
  /** Header height in px (default: 48) */
  headerHeight?: number;
  /** Detail pane width in px (default: 320) */
  detailPaneWidth?: number;
  /** Whether the sidebar is collapsed to icon-only width */
  sidebarCollapsed?: boolean;
  /** Width when sidebar is collapsed (default: 56) */
  sidebarCollapsedWidth?: number;
  className?: string;
  style?: CSSProperties;
}

// ─── Sub-component types ─────────────────────────────────────────────────────────

export interface AppShellHeaderProps {
  children: React.ReactNode;
  /** Header height in px — must match AppShell.headerHeight */
  height?: number;
  className?: string;
  style?: CSSProperties;
}

export interface AppShellSidebarProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface AppShellMainProps {
  children: React.ReactNode;
  /** Remove default padding for full-bleed content */
  noPadding?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface AppShellDetailPaneProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Sub-components ──────────────────────────────────────────────────────────────

/**
 * AppShell.Header — full-width top bar.
 * Sits at z-index sticky so dropdowns from the header layer above content.
 */
export const AppShellHeader: React.FC<AppShellHeaderProps> = ({
  children,
  height = 48,
  className,
  style,
}) => {
  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: `${height}px`,
    minHeight: `${height}px`,
    padding: '0 16px',
    background: 'var(--hsn-bg-header)',
    borderBottom: '1px solid var(--hsn-border-primary)',
    zIndex: zIndex.sticky,
    flexShrink: 0,
    gap: '8px',
    ...style,
  };

  return (
    <header className={className} style={headerStyle} role="banner">
      {children}
    </header>
  );
};

AppShellHeader.displayName = 'AppShellHeader';

/**
 * AppShell.Sidebar — fixed-width navigation rail.
 * Internally scrollable so long nav lists work correctly.
 */
export const AppShellSidebar: React.FC<AppShellSidebarProps> = ({
  children,
  className,
  style,
}) => {
  const sidebarStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--hsn-bg-sidepanel)',
    borderRight: '1px solid var(--hsn-border-primary)',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
    ...style,
  };

  return (
    <nav className={className} style={sidebarStyle} role="navigation" aria-label="Sidebar navigation">
      {children}
    </nav>
  );
};

AppShellSidebar.displayName = 'AppShellSidebar';

/**
 * AppShell.Main — the scrollable content region.
 * Takes all remaining horizontal space between sidebar and detail pane.
 */
export const AppShellMain: React.FC<AppShellMainProps> = ({
  children,
  noPadding = false,
  className,
  style,
}) => {
  const mainStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    background: 'var(--hsn-bg-main-container)',
    padding: noPadding ? 0 : '0',
    minWidth: 0,
    ...style,
  };

  return (
    <main className={className} style={mainStyle} role="main">
      {children}
    </main>
  );
};

AppShellMain.displayName = 'AppShellMain';

/**
 * AppShell.DetailPane — fixed-width contextual preview on the right.
 * Internally scrollable, separated from main by a 1px border.
 */
export const AppShellDetailPane: React.FC<AppShellDetailPaneProps> = ({
  children,
  className,
  style,
}) => {
  const paneStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'var(--hsn-bg-l1-solid)',
    borderLeft: '1px solid var(--hsn-border-primary)',
    overflowY: 'auto',
    overflowX: 'hidden',
    flexShrink: 0,
    ...style,
  };

  return (
    <aside className={className} style={paneStyle} aria-label="Detail pane">
      {children}
    </aside>
  );
};

AppShellDetailPane.displayName = 'AppShellDetailPane';

// ─── Toolbar ─────────────────────────────────────────────────────────────────────

export interface AppShellToolbarProps {
  children: React.ReactNode;
  /** Attach a bottom border (use at the top of a content area) */
  bordered?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * AppShell.Toolbar — compact action bar within a pane.
 * Enterprise density: 40px height, 8px horizontal padding.
 */
export const AppShellToolbar: React.FC<AppShellToolbarProps> = ({
  children,
  bordered = true,
  className,
  style,
}) => {
  const toolbarStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: '40px',
    minHeight: '40px',
    padding: '0 12px',
    gap: '4px',
    background: 'var(--hsn-bg-l1-solid)',
    borderBottom: bordered ? '1px solid var(--hsn-border-primary)' : undefined,
    flexShrink: 0,
    ...style,
  };

  return (
    <div className={className} style={toolbarStyle} role="toolbar">
      {children}
    </div>
  );
};

AppShellToolbar.displayName = 'AppShellToolbar';

// ─── Root AppShell ────────────────────────────────────────────────────────────────

/**
 * AppShell — root layout shell. Composes header + body (sidebar + main + detail).
 *
 * Usage:
 * ```tsx
 * <AppShell
 *   header={<AppShellHeader>...</AppShellHeader>}
 *   sidebar={<AppShellSidebar>...</AppShellSidebar>}
 *   detailPane={<AppShellDetailPane>...</AppShellDetailPane>}
 *   sidebarWidth={240}
 *   detailPaneWidth={320}
 * >
 *   <AppShellMain>...</AppShellMain>
 * </AppShell>
 * ```
 */
const AppShell: React.FC<AppShellProps> & {
  Header: typeof AppShellHeader;
  Sidebar: typeof AppShellSidebar;
  Main: typeof AppShellMain;
  DetailPane: typeof AppShellDetailPane;
  Toolbar: typeof AppShellToolbar;
} = ({
  header,
  sidebar,
  children,
  detailPane,
  sidebarWidth = 240,
  headerHeight = 48,
  detailPaneWidth = 320,
  sidebarCollapsed = false,
  sidebarCollapsedWidth = 56,
  className,
  style,
}) => {
  const effectiveSidebarWidth = sidebarCollapsed ? sidebarCollapsedWidth : sidebarWidth;

  const shellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100dvh',
    // Fallback for browsers without dvh support
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    background: 'var(--hsn-bg-app)',
    ...style,
  };

  const bodyStyle: CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
    // Body height = total height minus header
    height: `calc(100dvh - ${headerHeight}px)`,
  };

  const sidebarWrapStyle: CSSProperties = {
    width: `${effectiveSidebarWidth}px`,
    minWidth: `${effectiveSidebarWidth}px`,
    transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1), min-width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    height: '100%',
    overflow: 'hidden',
  };

  const detailPaneWrapStyle: CSSProperties = {
    width: `${detailPaneWidth}px`,
    minWidth: `${detailPaneWidth}px`,
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div className={className} style={shellStyle} data-haseen-shell="true">
      {header}
      <div style={bodyStyle}>
        {sidebar && <div style={sidebarWrapStyle}>{sidebar}</div>}
        {children}
        {detailPane && <div style={detailPaneWrapStyle}>{detailPane}</div>}
      </div>
    </div>
  );
};

AppShell.Header = AppShellHeader;
AppShell.Sidebar = AppShellSidebar;
AppShell.Main = AppShellMain;
AppShell.DetailPane = AppShellDetailPane;
AppShell.Toolbar = AppShellToolbar;

AppShell.displayName = 'AppShell';

export default AppShell;
