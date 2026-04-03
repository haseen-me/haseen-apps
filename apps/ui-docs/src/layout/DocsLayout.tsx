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
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{
          marginLeft: 'var(--docs-sidebar-width)',
          flex: 1,
          minWidth: 0,
        }}>
          <Header />
          <main style={{
            maxWidth: 860,
            margin: '0 auto',
            padding: '96px 40px 80px',
          }}>
            {children}
          </main>
        </div>
      </div>
    </MobileNavProvider>
  );
}
