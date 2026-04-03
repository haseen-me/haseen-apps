import { useDocsTheme } from '@/theme';
import { Sun, Moon, Github, ExternalLink } from 'lucide-react';

export function Header() {
  const { theme, toggle } = useDocsTheme();

  return (
    <header style={{
      height: 'var(--docs-header-height)',
      position: 'fixed',
      top: 0,
      left: 'var(--docs-sidebar-width)',
      right: 0,
      background: 'var(--docs-bg)',
      borderBottom: '1px solid var(--docs-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 24px',
      gap: 16,
      zIndex: 10,
      backdropFilter: 'blur(12px)',
    }}>
      <a
        href="https://www.npmjs.com/package/@haseen-me/ui"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--docs-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          textDecoration: 'none',
        }}
      >
        NPM <ExternalLink size={12} />
      </a>
      <a
        href="https://github.com/haseen-me/ui"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--docs-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          textDecoration: 'none',
        }}
      >
        <Github size={16} />
      </a>
      <button
        onClick={toggle}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--docs-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          padding: 4,
          borderRadius: 6,
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
