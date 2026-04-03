import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--acc-text)',
              fontWeight: 700,
              fontSize: 22,
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--acc-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              H
            </div>
            Haseen
          </Link>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--acc-bg-card)',
            borderRadius: 16,
            border: '1px solid var(--acc-border)',
            boxShadow: 'var(--acc-shadow)',
            padding: '36px 32px',
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, textAlign: 'center' }}>
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: 14,
                color: 'var(--acc-text-secondary)',
                textAlign: 'center',
                marginBottom: 28,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
