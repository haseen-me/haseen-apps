import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { Button, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';

export function RecoveryKeyPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const recoveryKey = useAuthStore((s) => s.recoveryKey);

  // If there's no recovery key in the store, the user shouldn't be on this page
  if (!recoveryKey) {
    navigate('/settings', { replace: true });
    return null;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    navigate('/settings');
  };

  return (
    <AuthLayout
      title="Save your recovery key"
      subtitle="This key is the only way to recover your account if you forget your password. Store it somewhere safe."
    >
      <Alert type="warning">
        <strong>Important:</strong> We cannot reset your password or recover your data without this key.
        If you lose both your password and recovery key, your data is permanently inaccessible.
      </Alert>

      <div
        style={{
          background: 'var(--acc-bg)',
          border: '1px solid var(--acc-border)',
          borderRadius: 'var(--acc-radius-sm)',
          padding: '20px 16px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: 15,
          letterSpacing: '0.05em',
          textAlign: 'center',
          color: 'var(--acc-text)',
          wordBreak: 'break-all',
          lineHeight: 1.8,
          marginBottom: 16,
          userSelect: 'all',
        }}
      >
        {recoveryKey}
      </div>

      <Button
        variant="secondary"
        fullWidth
        onClick={handleCopy}
        style={{ marginBottom: 20 }}
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </Button>

      <div style={{ marginBottom: 20 }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            cursor: 'pointer',
            fontSize: 13,
            color: 'var(--acc-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{
              marginTop: 2,
              accentColor: 'var(--acc-brand)',
              width: 16,
              height: 16,
              flexShrink: 0,
            }}
          />
          <span>
            I have saved my recovery key in a safe place and understand that
            Haseen cannot recover my account without it.
          </span>
        </label>
      </div>

      <Button
        fullWidth
        disabled={!confirmed}
        onClick={handleContinue}
      >
        Continue to Account
      </Button>

      <div
        style={{
          marginTop: 20,
          padding: '14px 16px',
          background: 'var(--acc-bg)',
          borderRadius: 'var(--acc-radius-sm)',
          border: '1px solid var(--acc-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AlertTriangle size={14} style={{ color: 'var(--acc-warning)' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Recommended storage</span>
        </div>
        <ul style={{ fontSize: 12, color: 'var(--acc-text-muted)', paddingLeft: 20, lineHeight: 1.8 }}>
          <li>Print it out and store in a safe</li>
          <li>Save in a password manager</li>
          <li>Write it down and keep with important documents</li>
        </ul>
      </div>
    </AuthLayout>
  );
}
