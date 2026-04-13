import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Key, Settings, Palette, Download } from 'lucide-react';
import { AppShell, AppShellHeader, AppShellSidebar, AppShellMain, Button, IconText, IconTextSize, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import { useAuthStore } from '@/store/auth';

const NAV_ITEMS = [
  { icon: <User size={16} />, label: 'Profile', path: '/settings' },
  { icon: <Shield size={16} />, label: 'Security', path: '/settings/security' },
  { icon: <Key size={16} />, label: 'Recovery', path: '/settings/recovery' },
  { icon: <Palette size={16} />, label: 'Appearance', path: '/settings/appearance' },
  { icon: <Download size={16} />, label: 'Export Data', path: '/settings/export' },
];

interface SettingsLayoutProps {
  children: ReactNode;
  activeTab?: string;
}

export function SettingsLayout({ children, activeTab }: SettingsLayoutProps) {
  const { user, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await storeLogout();
    navigate('/sign-in');
  };

  return (
    <AppShell
      header={
        <AppShellHeader>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--hsn-text-primary)',
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
                background: 'var(--hsn-cta-primary-default)',
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
          <div style={{ flex: 1 }} />
          <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>
            {user?.email ?? 'Account'}
          </Typography>
          <Button
            onClick={handleLogout}
            type={Type.TERTIARY}
            size={Size.SMALL}
            startIcon={<LogOut size={14} />}
          >
            Sign out
          </Button>
        </AppShellHeader>
      }
      sidebar={
        <AppShellSidebar>
          <div style={{ padding: '16px 12px 8px' }}>
            <IconText
              icon={<Settings size={12} />}
              label="Settings"
              size={IconTextSize.SMALL}
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--hsn-text-tertiary)',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          </div>
          <nav style={{ padding: '0 8px' }}>
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
                    color: isActive ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-secondary)',
                    background: isActive ? 'rgba(45, 184, 175, 0.1)' : 'transparent',
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
        </AppShellSidebar>
      }
      sidebarWidth={220}
    >
      <AppShellMain style={{ padding: '40px 32px' }}>
        {children}
      </AppShellMain>
    </AppShell>
  );
}
