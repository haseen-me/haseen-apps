import { useState } from 'react';
import { Mail, HardDrive, CalendarDays, Settings, LogOut, Moon, Sun, Users } from 'lucide-react';
import { useTheme, ThemeMode, Tooltip, TooltipPlacement } from '@haseen-me/ui';
import { PRODUCTS as PRODUCT_PATHS } from './products';

const PRODUCTS = [
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'drive', label: 'Drive', icon: HardDrive },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'contacts', label: 'Contacts', icon: Users },
] as const;

function getProductUrl(productId: keyof typeof PRODUCT_PATHS): string {
  return PRODUCT_PATHS[productId].path;
}

interface ProductRailProps {
  activeProduct: string;
}

export function ProductRail({ activeProduct }: ProductRailProps) {
  const [showLogout, setShowLogout] = useState(false);
  const { theme, setStoredTheme } = useTheme();
  const isDark = theme === ThemeMode.DARK;

  const handleLogout = () => {
    localStorage.removeItem('haseen-auth');
    localStorage.removeItem('haseen-crypto-keys');
    window.location.href = `${PRODUCT_PATHS.accounts.path}/sign-in`;
  };

  const railItemStyle = (isActive: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
    background: isActive ? 'rgba(45,184,175,0.2)' : 'transparent',
    textDecoration: 'none',
    transition: 'all 0.15s',
    position: 'relative',
    border: 'none',
    cursor: 'pointer',
  });

  return (
    <nav
      style={{
        width: 48,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--hsn-bg-rail, #16161e)',
        flexShrink: 0,
        paddingTop: 8,
        gap: 2,
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <a
        href="/"
        title="Haseen Home"
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#2db8af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 14,
          textDecoration: 'none', marginBottom: 12,
        }}
      >
        H
      </a>

      {/* Product icons */}
      {PRODUCTS.map(({ id, label, icon: Icon }) => {
        const isActive = id === activeProduct;
        return (
          <Tooltip key={id} content={label} placement={TooltipPlacement.RIGHT}>
            <a
              href={getProductUrl(id)}
              style={railItemStyle(isActive)}
            >
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: -4, width: 3, height: 20,
                    borderRadius: 2, background: '#2db8af',
                  }}
                />
              )}
              <Icon size={18} />
            </a>
          </Tooltip>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <Tooltip content={isDark ? 'Light mode' : 'Dark mode'} placement={TooltipPlacement.RIGHT}>
        <button
          onClick={() => setStoredTheme(isDark ? ThemeMode.LIGHT : ThemeMode.DARK)}
          style={{ ...railItemStyle(false), marginBottom: 4 }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </Tooltip>

      {/* Settings */}
      <Tooltip content="Account Settings" placement={TooltipPlacement.RIGHT}>
        <a
          href={`${PRODUCT_PATHS.accounts.path}/settings`}
          style={{ ...railItemStyle(false), marginBottom: 4 }}
        >
          <Settings size={18} />
        </a>
      </Tooltip>

      {/* User menu */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Tooltip content="User menu" placement={TooltipPlacement.RIGHT}>
          <button
            onClick={() => setShowLogout(!showLogout)}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#2db8af', color: '#fff',
              fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            U
          </button>
        </Tooltip>
        {showLogout && (
          <button
            onClick={handleLogout}
            style={{
              position: 'absolute',
              bottom: 0, left: 40,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8,
              background: 'var(--hsn-bg-l3-solid)',
              color: 'var(--hsn-text-primary)',
              border: '1px solid var(--hsn-border-primary)',
              fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer',
              boxShadow: 'var(--hsn-shadow-l3)',
              zIndex: 100,
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
