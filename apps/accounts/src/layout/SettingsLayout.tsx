import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Key, Settings, Palette } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const NAV_ITEMS = [
  { icon: <User size={18} />, label: 'Profile', path: '/settings' },
  { icon: <Shield size={18} />, label: 'Security', path: '/settings/security' },
  { icon: <Key size={18} />, label: 'Recovery', path: '/settings/recovery' },
  { icon: <Palette size={18} />, label: 'Appearance', path: '/settings/appearance' },
];

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export function SettingsLayout({ children, activeTab }: SettingsLayoutProps) {
  const { user, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    storeLogout();
    navigate('/sign-in');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          height: 64,
          background: 'var(--acc-bg-card)',
          borderBottom: '1px solid var(--acc-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--acc-text)',
            fontWeight: 700,
            fontSize: 18,
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: 'var(--acc-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            H
          </div>
          Haseen
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--acc-text-secondary)' }}>
            {user?.email ?? 'Account'}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--acc-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              transition: 'color 0.15s',
            }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding: '40px 24px',
          display: 'flex',
          gap: 32,
        }}
      >
        {/* Sidebar nav */}
        <nav style={{ width: 220, flexShrink: 0 }}>
          <h3
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--acc-text-muted)',
              padding: '0 12px',
              marginBottom: 8,
            }}
          >
            <Settings size={12} style={{ marginRight: 4, verticalAlign: -1 }} />
            Settings
          </h3>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? 'var(--acc-brand)' : 'var(--acc-text-secondary)',
                  background: isActive ? 'var(--acc-brand-subtle)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                  marginBottom: 2,
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
