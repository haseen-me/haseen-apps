import { useDocsTheme } from '@/theme';
import { Sun, Moon, Github, ExternalLink, Menu, Sparkles } from 'lucide-react';
import { useMobileNav } from './mobile';

export function Header() {
  const { theme, toggle } = useDocsTheme();
  const { toggle: toggleNav } = useMobileNav();

  return (
    <header style={{
      height: 'var(--docs-header-height)',
      position: 'fixed',
      top: 0,
      left: 'var(--docs-sidebar-width)',
      right: 0,
      background: 'var(--docs-bg-secondary)',
      borderBottom: '1px solid var(--docs-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      gap: 16,
      zIndex: 10,
      backdropFilter: 'blur(18px)',
    }}>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={toggleNav}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--docs-text-secondary)',
          padding: 4,
          marginRight: 'auto',
        }}
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid var(--docs-border)',
            background: 'var(--docs-bg-tertiary)',
            color: 'var(--docs-text-secondary)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.03em',
          }}
        >
          <Sparkles size={14} />
          Premium Haseen UI
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <a
          href="https://www.npmjs.com/package/@haseen-me/ui"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--docs-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid var(--docs-border)',
            background: 'var(--docs-bg-tertiary)',
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
            fontWeight: 600,
            color: 'var(--docs-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            textDecoration: 'none',
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid var(--docs-border)',
            background: 'var(--docs-bg-tertiary)',
          }}
        >
          <Github size={16} />
        </a>
        <button
          onClick={toggle}
          style={{
            cursor: 'pointer',
            color: 'var(--docs-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid var(--docs-border)',
            background: 'var(--docs-bg-tertiary)',
          }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
