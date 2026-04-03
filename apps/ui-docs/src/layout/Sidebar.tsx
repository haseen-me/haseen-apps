import { NavLink, useLocation } from 'react-router-dom';
import { NAV_SECTIONS } from '@/nav';
import { Search, Command } from 'lucide-react';
import { useState, useMemo } from 'react';

export function Sidebar() {
  const location = useLocation();
  const [search, setSearch] = useState('');

  const filteredSections = useMemo(() => {
    if (!search.trim()) return NAV_SECTIONS;
    const q = search.toLowerCase();
    return NAV_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.label.toLowerCase().includes(q)),
    })).filter((section) => section.items.length > 0);
  }, [search]);

  return (
    <aside style={{
      width: 'var(--docs-sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--docs-sidebar-bg)',
      borderRight: '1px solid var(--docs-border)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 10,
    }}>
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
          width: 28,
          height: 28,
          borderRadius: 6,
          background: 'var(--docs-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
        }}>
          H
        </div>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Haseen</span>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px 8px', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid var(--docs-border)',
          background: 'var(--docs-bg)',
          fontSize: 13,
          color: 'var(--docs-text-tertiary)',
        }}>
          <Search size={14} />
          <input
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
            borderRadius: 4,
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
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 14,
                    color: isActive ? 'var(--docs-accent)' : 'var(--docs-text-secondary)',
                    background: isActive ? 'var(--docs-sidebar-active)' : 'transparent',
                    fontWeight: isActive ? 500 : 400,
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                    borderLeft: isActive ? '2px solid var(--docs-accent)' : '2px solid transparent',
                  }}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
