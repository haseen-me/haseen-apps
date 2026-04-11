import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MoonStar, ShieldCheck, Sparkles, SunMedium } from 'lucide-react';
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
        padding: '28px 20px',
      }}
    >
      <div className="auth-shell">
        <section className="auth-hero">
          <div
            className="auth-orb"
            style={{ width: 180, height: 180, right: -20, top: -30, background: 'rgba(90, 140, 255, 0.22)' }}
          />
          <div
            className="auth-orb"
            style={{ width: 150, height: 150, left: -30, bottom: 30, background: 'rgba(45, 184, 175, 0.24)' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                color: 'var(--acc-text)',
                fontWeight: 800,
                fontSize: 22,
                textDecoration: 'none',
                letterSpacing: '-0.04em',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--acc-brand), var(--acc-brand-2))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 18,
                  boxShadow: '0 18px 28px -18px rgba(45, 184, 175, 0.78)',
                }}
              >
                H
              </div>
              Haseen
            </Link>

            <button className="auth-theme-button" onClick={() => setIsDark((value) => !value)} type="button">
              {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
              {isDark ? 'Light' : 'Dark'}
            </button>
          </div>

          <div style={{ marginTop: 54, maxWidth: 520 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.46)',
                border: '1px solid var(--acc-panel-border)',
                color: 'var(--acc-text-secondary)',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.03em',
              }}
            >
              <Sparkles size={14} />
              Privacy-first workspace
            </div>

            <h1
              style={{
                marginTop: 18,
                fontSize: 'clamp(2.4rem, 4vw, 4.3rem)',
                lineHeight: 1,
                letterSpacing: '-0.06em',
                fontWeight: 800,
                maxWidth: 640,
              }}
            >
              Calm, encrypted productivity with a sharper edge.
            </h1>

            <p
              style={{
                marginTop: 16,
                maxWidth: 520,
                fontSize: 16,
                color: 'var(--acc-text-secondary)',
                lineHeight: 1.7,
              }}
            >
              Haseen brings mail, drive, calendar and identity into a cleaner, faster account experience
              inspired by the polish of Apple, Proton and Skiff.
            </p>

            <div className="auth-grid">
              <div className="auth-kpi">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'var(--acc-text)' }}>
                  <ShieldCheck size={18} />
                  <strong>Zero-knowledge by default</strong>
                </div>
                <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)' }}>
                  Local key generation, SRP auth, and private recovery flows keep the account layer trustworthy.
                </p>
              </div>
              <div className="auth-kpi">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, color: 'var(--acc-text)' }}>
                  <Sparkles size={18} />
                  <strong>Modern across light and dark</strong>
                </div>
                <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)' }}>
                  Glassy surfaces, quieter typography, and deeper contrast make the UI feel more premium.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div
            style={{
              background: 'linear-gradient(180deg, var(--acc-bg-card-strong), var(--acc-bg-card))',
              borderRadius: 24,
              border: '1px solid var(--acc-border)',
              boxShadow: 'var(--acc-shadow-soft)',
              padding: '36px 30px',
            }}
          >
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: 'center', letterSpacing: '-0.05em' }}>
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontSize: 14,
                  color: 'var(--acc-text-secondary)',
                  textAlign: 'center',
                  marginBottom: 28,
                  lineHeight: 1.6,
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
