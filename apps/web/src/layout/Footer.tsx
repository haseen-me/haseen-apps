import { Link } from 'react-router-dom';
import { Mail, Shield, Github } from 'lucide-react';
import { Typography, TypographySize } from '@haseen-me/ui';

const PRODUCT_LINKS = [
  { label: 'Mail', path: '/features' },
  { label: 'Drive', path: '/features' },
  { label: 'Calendar', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
];

const COMPANY_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Security', path: '/security' },
  { label: 'Privacy Policy', path: '/about' },
  { label: 'Terms of Service', path: '/about' },
];

const RESOURCE_LINKS = [
  { label: 'UI Components', path: '/ui' },
  { label: 'Documentation', path: '/about' },
  { label: 'Status', path: '/about' },
  { label: 'Contact', path: '/about' },
];

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--hsn-bg-dark)',
        color: '#c9d1d9',
        padding: '80px 24px 40px',
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48,
        }}
      >
        {/* Brand */}
        <div>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontWeight: 700,
              fontSize: 20,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--hsn-cta-primary-default)',
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
          <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 280, color: '#8b95a8' }}>
            Privacy-first, end-to-end encrypted productivity.
            Your data belongs to you — always.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <a
              href="mailto:hello@haseen.me"
              style={{ color: '#8b95a8', transition: 'color 0.15s' }}
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://github.com/haseen-me"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#8b95a8', transition: 'color 0.15s' }}
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
            <Link to="/security" style={{ color: '#8b95a8', transition: 'color 0.15s' }} aria-label="Security">
              <Shield size={18} />
            </Link>
          </div>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: 16 }}>
            Product
          </h4>
          {PRODUCT_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.path}
              style={{ display: 'block', fontSize: 14, color: '#8b95a8', padding: '4px 0', transition: 'color 0.15s' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Company */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: 16 }}>
            Company
          </h4>
          {COMPANY_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.path}
              style={{ display: 'block', fontSize: 14, color: '#8b95a8', padding: '4px 0', transition: 'color 0.15s' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fff', marginBottom: 16 }}>
            Resources
          </h4>
          {RESOURCE_LINKS.map((l) => (
            <Link
              key={l.label}
              to={l.path}
              style={{ display: 'block', fontSize: 14, color: '#8b95a8', padding: '4px 0', transition: 'color 0.15s' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="container"
        style={{
          marginTop: 60,
          paddingTop: 24,
          borderTop: '1px solid #21262d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 13, color: '#6e7681' }}>
          © {new Date().getFullYear()} Haseen. All rights reserved.
        </p>
        <p style={{ fontSize: 13, color: '#6e7681' }}>
          Made with privacy in mind.
        </p>
      </div>
    </footer>
  );
}
