import { Sun, Moon, Monitor } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Surface, Typography, TypographySize, TypographyWeight, useTheme, ThemeMode, StorageOnlyThemeMode } from '@haseen-me/ui';

type AnyTheme = typeof ThemeMode.LIGHT | typeof ThemeMode.DARK | typeof StorageOnlyThemeMode.SYSTEM;

const THEME_OPTIONS: { value: AnyTheme; label: string; icon: typeof Sun; desc: string }[] = [
  { value: ThemeMode.LIGHT, label: 'Light', icon: Sun, desc: 'Always use the light theme' },
  { value: ThemeMode.DARK, label: 'Dark', icon: Moon, desc: 'Always use the dark theme' },
  { value: StorageOnlyThemeMode.SYSTEM, label: 'System', icon: Monitor, desc: 'Follow your operating system setting' },
];

export function AppearanceSettingsPage() {
  const { theme, setStoredTheme } = useTheme() as { theme: AnyTheme; setStoredTheme: (mode: AnyTheme) => void; storedTheme: AnyTheme };

  return (
    <SettingsLayout activeTab="/settings/appearance">
      <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 4 }}>
        Appearance
      </Typography>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 32 }}>
        Customize how Haseen looks on your device.
      </Typography>

      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 16 }}>
          Theme
        </Typography>
        <div style={{ display: 'flex', gap: 12 }}>
          {THEME_OPTIONS.map((opt) => {
            const isActive = theme === opt.value;
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setStoredTheme(opt.value)}
                style={{
                  flex: 1,
                  padding: 16,
                  borderRadius: 10,
                  border: isActive ? '2px solid var(--hsn-accent-teal)' : '1px solid var(--hsn-border-primary)',
                  background: isActive ? 'rgba(45, 184, 175, 0.08)' : 'var(--hsn-bg-l0-solid)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={24} style={{ color: isActive ? 'var(--hsn-accent-teal)' : 'var(--hsn-icon-secondary)' }} />
                <Typography size={TypographySize.BODY} weight={isActive ? TypographyWeight.SEMIBOLD : TypographyWeight.REGULAR}>
                  {opt.label}
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', textAlign: 'center' }}>
                  {opt.desc}
                </Typography>
              </button>
            );
          })}
        </div>
      </Surface>

      <Surface level="l1" style={{ padding: 24 }}>
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 12 }}>
          Preview
        </Typography>
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: 16,
            borderRadius: 8,
            border: '1px solid var(--hsn-border-primary)',
            background: 'var(--hsn-bg-l0-solid)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--hsn-cta-primary-default)',
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
            <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'var(--hsn-text-primary)', opacity: 0.15, marginBottom: 6 }} />
            <div style={{ height: 10, width: '90%', borderRadius: 4, background: 'var(--hsn-text-secondary)', opacity: 0.12, marginBottom: 4 }} />
            <div style={{ height: 10, width: '75%', borderRadius: 4, background: 'var(--hsn-text-secondary)', opacity: 0.12 }} />
          </div>
        </div>
      </Surface>
    </SettingsLayout>
  );
}
