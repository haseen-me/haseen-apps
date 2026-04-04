import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';

type Theme = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: 'light', label: 'Light', icon: Sun, desc: 'Always use the light theme' },
  { value: 'dark', label: 'Dark', icon: Moon, desc: 'Always use the dark theme' },
  { value: 'system', label: 'System', icon: Monitor, desc: 'Follow your operating system setting' },
];

function getStoredTheme(): Theme {
  const stored = localStorage.getItem('haseen-theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  let isDark: boolean;
  if (theme === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  } else {
    isDark = theme === 'dark';
  }
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('haseen-theme', theme);
}

export function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system color scheme changes when set to "system"
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <SettingsLayout activeTab="/settings/appearance">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Appearance</h1>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 32 }}>
        Customize how Haseen looks on your device.
      </p>

      {/* Theme selector */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Theme</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          {THEME_OPTIONS.map((opt) => {
            const isActive = theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 'var(--acc-radius-sm)',
                  border: isActive ? '2px solid var(--acc-brand)' : '1px solid var(--acc-border)',
                  background: isActive ? 'var(--acc-brand-subtle)' : 'var(--acc-bg-card)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={24} style={{ color: isActive ? 'var(--acc-brand)' : 'var(--acc-text-muted)' }} />
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400, color: 'var(--acc-text)' }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--acc-text-muted)', textAlign: 'center' }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Preview</h3>
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 16,
            borderRadius: 'var(--acc-radius-sm)',
            border: '1px solid var(--acc-border)',
            background: 'var(--acc-bg)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--acc-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            H
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'var(--acc-text)', opacity: 0.2, marginBottom: 6 }} />
            <div style={{ height: 10, width: '90%', borderRadius: 4, background: 'var(--acc-text-muted)', opacity: 0.15, marginBottom: 4 }} />
            <div style={{ height: 10, width: '75%', borderRadius: 4, background: 'var(--acc-text-muted)', opacity: 0.15 }} />
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
