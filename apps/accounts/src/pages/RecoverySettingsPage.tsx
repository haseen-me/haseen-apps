import { useState } from 'react';
import { Copy, Check, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Banner, Button, Surface, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

export function RecoverySettingsPage() {
  const { recoveryKey: storedKey, setRecoveryKey } = useAuthStore();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recoveryKey = storedKey ?? 'No recovery key stored — regenerate below';

  const handleCopy = async () => {
    if (!storedKey) return;
    await navigator.clipboard.writeText(storedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const { recoveryKey: newKey } = await authApi.generateRecoveryKey();
      setRecoveryKey(newKey);
      setShowKey(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate recovery key');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <SettingsLayout activeTab="/settings/recovery">
      <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 4 }}>
        Recovery Key
      </Typography>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 32 }}>
        Your recovery key is the only way to access your account if you forget your password.
      </Typography>

      {error && <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>{error}</Banner>}

      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Key size={18} style={{ color: 'var(--hsn-accent-teal)' }} />
          <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Your Recovery Key</Typography>
        </div>

        <Banner color="warning" icon={<AlertTriangle size={16} />} style={{ marginBottom: 16, borderRadius: 8 }}>
          Keep this key in a safe place. Without it, account recovery from a forgotten password is impossible.
        </Banner>

        {!showKey ? (
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={() => setShowKey(true)}>
            Reveal recovery key
          </Button>
        ) : (
          <>
            <Surface level="l0" style={{ padding: '20px 16px', marginBottom: 12, userSelect: 'all' }}>
              <Typography
                size={TypographySize.BODY}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  lineHeight: 1.8,
                }}
              >
                {recoveryKey}
              </Typography>
            </Surface>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type={Type.SECONDARY}
                size={Size.MEDIUM}
                onClick={handleCopy}
                startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={() => setShowKey(false)}>
                Hide
              </Button>
            </div>
          </>
        )}
      </Surface>

      <Surface level="l1" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--hsn-accent-orange)' }} />
          <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Regenerate Recovery Key</Typography>
        </div>
        <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
          This will invalidate your previous recovery key. Make sure to save the new one.
        </Typography>
        <Button
          type={Type.SECONDARY}
          size={Size.MEDIUM}
          onClick={handleRegenerate}
          loading={regenerating}
          startIcon={<RefreshCw size={14} />}
        >
          Generate new key
        </Button>
      </Surface>
    </SettingsLayout>
  );
}
