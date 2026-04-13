import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MoonStar, SunMedium } from 'lucide-react';
import { Surface, Typography, TypographySize, TypographyWeight, IconButton, Type, Size, useTheme, ThemeMode } from '@haseen-me/ui';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { theme, setStoredTheme } = useTheme();
  const isDark = theme === ThemeMode.DARK;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--hsn-bg-app)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Surface level="l1" style={{ padding: 18 }}>
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
                color: 'var(--hsn-text-primary)',
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

            <IconButton
              icon={isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
              onClick={() => setStoredTheme(isDark ? ThemeMode.LIGHT : ThemeMode.DARK)}
              type={Type.TERTIARY}
              size={Size.SMALL}
              tooltip={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            />
          </div>

          <Surface level="l2" style={{ padding: '28px 22px' }}>
            <Typography
              size={TypographySize.H2}
              weight={TypographyWeight.SEMIBOLD}
              style={{ textAlign: 'center', marginBottom: subtitle ? 6 : 22 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                size={TypographySize.BODY}
                style={{
                  color: 'var(--hsn-text-secondary)',
                  textAlign: 'center',
                  marginBottom: 22,
                }}
              >
                {subtitle}
              </Typography>
            )}
            {children}
          </Surface>
        </Surface>
      </div>
    </div>
  );
}
