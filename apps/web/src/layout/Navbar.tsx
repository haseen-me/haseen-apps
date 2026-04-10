import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

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
        height: 'var(--hsn-header-height)',
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--hsn-border)' : '1px solid transparent',
        zIndex: 100,
        transition: 'all 0.25s',
      }}
    >
      <nav
        style={{
          maxWidth: 'var(--hsn-max-width)',
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
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'var(--hsn-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            H
          </div>
          Haseen
        </Link>

        {/* Desktop links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
          }}
          className="nav-desktop"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: 15,
                fontWeight: 500,
                color:
                  location.pathname === link.path
                    ? 'var(--hsn-brand)'
                    : 'var(--hsn-text-secondary)',
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="nav-desktop">
          <a
            href="/accounts"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--hsn-text-secondary)',
              textDecoration: 'none'
            }}
          >
            Sign in
          </a>
          <a
            href="/accounts/sign-up"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--hsn-brand)',
              padding: '8px 20px',
              borderRadius: 8,
              transition: 'background 0.15s',
              textDecoration: 'none'
            }}
          >
            Get Started
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--hsn-text)',
            padding: 4,
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--hsn-header-height)',
            left: 0,
            right: 0,
            background: '#fff',
            borderBottom: '1px solid var(--hsn-border)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: '10px 0',
                color:
                  location.pathname === link.path
                    ? 'var(--hsn-brand)'
                    : 'var(--hsn-text)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/pricing"
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#fff',
              background: 'var(--hsn-brand)',
              padding: '12px 0',
              borderRadius: 8,
              textAlign: 'center',
              marginTop: 8,
            }}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
