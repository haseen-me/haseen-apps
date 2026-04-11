import { NavLink, useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from '@/nav';
import { Search, Command, X } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useMobileNav } from './mobile';

export function Sidebar() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { open, close } = useMobileNav();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filteredSections = useMemo<typeof NAV_SECTIONS>(() => {
    if (!search.trim()) return NAV_SECTIONS;
    const q = search.toLowerCase();
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((section) => section.items.length > 0);
  }, [search]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 19,
          }}
        />
      )}
      <aside
        className={open ? 'sidebar-open' : ''}
        style={{
          width: 280,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: 'var(--docs-sidebar-bg)',
          borderRight: '1px solid var(--docs-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 20,
          transition: 'transform 0.2s ease',
          backdropFilter: 'blur(18px) saturate(140%)',
        }}
      >
      {/* Logo */}
      <div style={{
        height: 'var(--docs-header-height)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 10,
        borderBottom: '1px solid var(--docs-border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--docs-accent), var(--docs-accent-2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          boxShadow: '0 18px 28px -20px rgba(45, 184, 175, 0.8)',
        }}>
          H
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.03em' }}>Haseen UI</div>
          <div style={{ fontSize: 12, color: 'var(--docs-text-tertiary)' }}>Docs and patterns</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 14,
          border: '1px solid var(--docs-border)',
          background: 'var(--docs-bg-tertiary)',
          fontSize: 13,
          color: 'var(--docs-text-tertiary)',
        }}>
          <Search size={14} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search Haseen UI..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--docs-text-primary)',
              fontSize: 13,
              flex: 1,
              fontFamily: 'inherit',
            }}
          />
          <kbd style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 999,
            border: '1px solid var(--docs-border)',
            background: 'var(--docs-bg-tertiary)',
            color: 'var(--docs-text-tertiary)',
          }}>
            <Command size={10} /> K
          </kbd>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px 12px 24px',
      }}>
        {filteredSections.map((section) => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--docs-text-tertiary)',
              padding: '4px 8px',
              marginBottom: 4,
            }}>
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path || location.pathname === `/ui${item.path}`;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'block',
                    padding: '9px 12px',
                    borderRadius: 14,
                    fontSize: 14,
                    color: isActive ? 'var(--docs-accent)' : 'var(--docs-text-secondary)',
                    background: isActive ? 'var(--docs-sidebar-active)' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    border: isActive ? '1px solid rgba(45, 184, 175, 0.28)' : '1px solid transparent',
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Mobile close button */}
      <button
        className="sidebar-close-btn"
        onClick={close}
        style={{
          display: 'none',
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--docs-text-secondary)',
          padding: 4,
        }}
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>
    </aside>
    </>
  );
}
