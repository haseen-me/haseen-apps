import { useState } from 'react';
import { Copy, Check, RefreshCw, Key, AlertTriangle } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Button, Alert } from '@/components/FormUI';

export function RecoverySettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  // In production, would be decrypted from the user's encrypted recovery key store
  const recoveryKey = 'HSNR-4K7M-X9P2-QW3E-T8YU-6NB5-ZD1A-VF0H';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    // In production: authApi.generateRecoveryKey(token)
    setTimeout(() => setRegenerating(false), 1000);
  };

  return (
    <SettingsLayout activeTab="/settings/recovery">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Recovery Key</h1>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 32 }}>
        Your recovery key is the only way to access your account if you forget your password.
      </p>

      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Key size={18} style={{ color: 'var(--acc-brand)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Your Recovery Key</h3>
        </div>

        <Alert type="warning">
          Keep this key in a safe place. Without it, account recovery from a forgotten password is impossible.
        </Alert>

        {!showKey ? (
          <Button variant="secondary" onClick={() => setShowKey(true)}>
            Reveal recovery key
          </Button>
        ) : (
          <>
            <div
              style={{
                background: 'var(--acc-bg)',
                border: '1px solid var(--acc-border)',
                borderRadius: 'var(--acc-radius-sm)',
                padding: '20px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 15,
                letterSpacing: '0.05em',
                textAlign: 'center',
                color: 'var(--acc-text)',
                wordBreak: 'break-all',
                lineHeight: 1.8,
                marginBottom: 12,
                userSelect: 'all',
              }}
            >
              {recoveryKey}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button variant="secondary" onClick={() => setShowKey(false)}>
                Hide
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Regenerate */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--acc-warning)' }} />
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Regenerate Recovery Key</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--acc-text-secondary)', marginBottom: 16 }}>
          This will invalidate your previous recovery key. Make sure to save the new one.
        </p>
        <Button variant="secondary" onClick={handleRegenerate} loading={regenerating}>
          <RefreshCw size={14} /> Generate new key
        </Button>
      </div>
    </SettingsLayout>
  );
}
