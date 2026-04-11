import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavProvider } from './mobile';

interface DocsLayoutProps {
  children: ReactNode;
}

export function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <MobileNavProvider>
      <div style={{ display: 'flex', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <div style={{
          marginLeft: 'var(--docs-sidebar-width)',
          flex: 1,
          minWidth: 0,
        }}>
          <Header />
          <main style={{
            maxWidth: 1040,
            margin: '0 auto',
            padding: '116px 40px 88px',
          }}>
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
