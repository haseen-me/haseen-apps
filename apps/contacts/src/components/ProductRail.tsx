import { Mail, HardDrive, CalendarDays, Settings, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

const PRODUCTS = [
  { id: 'mail', label: 'Mail', icon: Mail, port: 3001 },
  { id: 'drive', label: 'Drive', icon: HardDrive, port: 3002 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, port: 3004 },
  { id: 'contacts', label: 'Contacts', icon: Users, port: 3005 },
] as const;

const THEME_KEY = 'haseen-theme';

function getProductUrl(port: number): string {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
}

function getInitialDark(): boolean {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ProductRail({ activeProduct }: { activeProduct: string }) {
  const [showLogout, setShowLogout] = useState(false);
  const [dark, setDark] = useState(getInitialDark);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const handleLogout = () => {
    localStorage.removeItem('haseen-auth');
    localStorage.removeItem('haseen-crypto-keys');
    const { protocol, hostname } = window.location;
    window.location.href = `${protocol}//${hostname}:3003/sign-in`;
  };

  return (
    <nav
      style={{
        width: 48,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#1a1a2e',
        flexShrink: 0,
        paddingTop: 8,
        gap: 2,
      }}
    >
      <a
        href={getProductUrl(3000)}
        title="Haseen Home"
        style={{
          width: 32, height: 32, borderRadius: 8, background: '#2db8af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', marginBottom: 12,
        }}
      >
        H
      </a>

      {PRODUCTS.map(({ id, label, icon: Icon, port }) => {
        const isActive = id === activeProduct;
        return (
          <a
            key={id}
            href={getProductUrl(port)}
            title={label}
            style={{
              width: 36, height: 36, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(45,184,175,0.2)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s', position: 'relative',
            }}
          >
            {isActive && (
              <span style={{ position: 'absolute', left: -4, width: 3, height: 20, borderRadius: 2, background: '#2db8af' }} />
            )}
            <Icon size={18} />
          </a>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        onClick={() => setDark(!dark)}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.45)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: 4,
        }}
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <a
        href={getProductUrl(3003)}
        title="Account Settings"
        style={{
          width: 36, height: 36, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 4,
        }}
      >
        <Settings size={18} />
      </a>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowLogout(!showLogout)}
          title="User menu"
          style={{
            width: 28, height: 28, borderRadius: '50%', background: '#2db8af',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 600, marginBottom: 12, cursor: 'pointer', border: 'none',
          }}
        >
          U
        </button>
        {showLogout && (
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute', bottom: 8, left: 44,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, background: '#1a1a2e', color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)', fontSize: 13, whiteSpace: 'nowrap',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100,
            }}
          >
            <LogOut size={14} />
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
