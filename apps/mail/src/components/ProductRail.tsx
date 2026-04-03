import { Mail, HardDrive, CalendarDays, Settings } from 'lucide-react';

const PRODUCTS = [
  { id: 'mail', label: 'Mail', icon: Mail, port: 3001 },
  { id: 'drive', label: 'Drive', icon: HardDrive, port: 3002 },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, port: 3004 },
] as const;

function getProductUrl(port: number): string {
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${port}`;
}

export function ProductRail({ activeProduct }: { activeProduct: string }) {
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
      {/* Haseen logo */}
      <a
        href={getProductUrl(3000)}
        title="Haseen Home"
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: '#2db8af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: 14,
          textDecoration: 'none',
          marginBottom: 12,
        }}
      >
        H
      </a>

      {/* Product icons */}
      {PRODUCTS.map(({ id, label, icon: Icon, port }) => {
        const isActive = id === activeProduct;
        return (
          <a
            key={id}
            href={getProductUrl(port)}
            title={label}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
              background: isActive ? 'rgba(45,184,175,0.2)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.15s',
              position: 'relative',
            }}
          >
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  left: -4,
                  width: 3,
                  height: 20,
                  borderRadius: 2,
                  background: '#2db8af',
                }}
              />
            )}
            <Icon size={18} />
          </a>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Bottom icons */}
      <a
        href={getProductUrl(3003)}
        title="Account Settings"
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.45)',
          textDecoration: 'none',
          marginBottom: 4,
        }}
      >
        <Settings size={18} />
      </a>
      <div
        title="User"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#2db8af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 11,
          fontWeight: 600,
          marginBottom: 12,
          cursor: 'default',
        }}
      >
        U
      </div>
    </nav>
  );
}
