import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MoonStar, SunMedium } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [isDark, setIsDark] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark',
  );

  useEffect(() => {
    const nextTheme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('haseen-theme', nextTheme);
  }, [isDark]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div className="auth-shell" style={{ maxWidth: 460 }}>
        <section className="auth-panel" style={{ padding: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Link
              to="/"
              style={{
                display: 'inline-flex',
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
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--acc-brand), var(--acc-brand-2))',
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

            <button className="auth-theme-button" onClick={() => setIsDark((value) => !value)} type="button">
              {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
            </button>
          </div>

          <div
            style={{
              background: 'linear-gradient(180deg, var(--acc-bg-card-strong), var(--acc-bg-card))',
              borderRadius: 20,
              border: '1px solid var(--acc-border)',
              boxShadow: 'var(--acc-shadow-soft)',
              padding: '28px 22px',
            }}
          >
            <h2 style={{ fontSize: 26, fontWeight: 750, marginBottom: 6, textAlign: 'center', letterSpacing: '-0.03em' }}>
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--acc-text-secondary)',
                  textAlign: 'center',
                  marginBottom: 22,
                }}
              >
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
