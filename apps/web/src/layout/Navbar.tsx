import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button, IconButton, Type, Size } from '@haseen-me/ui';

const NAV_LINKS = [
  { label: 'Features', path: '/features' },
  { label: 'Security', path: '/security' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About', path: '/about' },
];

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--hsn-header-height, 64px)',
        background: scrolled ? 'var(--hsn-bg-header)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--hsn-border-primary)' : '1px solid transparent',
        zIndex: 100,
        transition: 'all 0.25s',
      }}
    >
      <nav
        style={{
          maxWidth: 'var(--hsn-max-width, 1200px)',
          margin: '0 auto',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontWeight: 700,
            fontSize: 20,
            color: 'var(--hsn-text-primary)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--hsn-brand-light), var(--hsn-accent-teal))',
              boxShadow: '0 10px 24px rgba(15, 118, 110, 0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 16,
            }}
          >
            H
          </div>
          Haseen
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: 15, fontWeight: 500,
                color: location.pathname === link.path ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button type={Type.TERTIARY} size={Size.MEDIUM} onClick={() => { window.location.href = '/accounts'; }}>
            Sign in
          </Button>
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={() => { window.location.href = '/accounts/sign-up'; }}>
            Get Started
          </Button>
        </div>

        {/* Mobile hamburger */}
        <IconButton
          className="nav-mobile-btn"
          icon={mobileOpen ? <X size={24} /> : <Menu size={24} />}
          onClick={() => setMobileOpen(!mobileOpen)}
          type={Type.TERTIARY}
          size={Size.MEDIUM}
          style={{ display: 'none' }}
        />
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--hsn-header-height, 64px)',
            left: 0,
            right: 0,
            background: 'var(--hsn-bg-header)',
            borderBottom: '1px solid var(--hsn-border-primary)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: 16, fontWeight: 500, padding: '10px 0',
                color: location.pathname === link.path ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-primary)',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 8 }}>
            <Button type={Type.PRIMARY} size={Size.LARGE} fullWidth onClick={() => { window.location.href = '/accounts/sign-up'; }}>
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
