import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { Banner, Button, Surface, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';
import { useAuthStore } from '@/store/auth';

export function RecoveryKeyPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const recoveryKey = useAuthStore((s) => s.recoveryKey);

  useEffect(() => {
    if (!recoveryKey) {
      navigate('/settings', { replace: true });
    }
  }, [recoveryKey, navigate]);

  if (!recoveryKey) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(recoveryKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthLayout
      title="Save your recovery key"
      subtitle="This key is the only way to recover your account if you forget your password. Store it somewhere safe."
    >
      <Banner color="warning" icon={<AlertTriangle size={16} />} style={{ marginBottom: 20, borderRadius: 8 }}>
        We cannot reset your password or recover your data without this key. If you lose both your password and recovery key, your data is permanently inaccessible.
      </Banner>

      <Surface level="l0" style={{ padding: '20px 16px', marginBottom: 16, userSelect: 'all' }}>
        <Typography
          size={TypographySize.BODY}
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: '0.05em',
            textAlign: 'center',
            wordBreak: 'break-all',
            lineHeight: 1.8,
          }}
        >
          {recoveryKey}
        </Typography>
      </Surface>

      <Button
        type={Type.SECONDARY}
        size={Size.LARGE}
        fullWidth
        onClick={handleCopy}
        startIcon={copied ? <Check size={16} /> : <Copy size={16} />}
        style={{ marginBottom: 20 }}
      >
        {copied ? 'Copied!' : 'Copy to clipboard'}
      </Button>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', lineHeight: 1.5 }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ marginTop: 2, accentColor: 'var(--hsn-accent-teal)', width: 16, height: 16, flexShrink: 0 }}
          />
          <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>
            I have saved my recovery key in a safe place and understand that Haseen cannot recover my account without it.
          </Typography>
        </label>
      </div>

      <Button
        type={Type.PRIMARY}
        size={Size.LARGE}
        fullWidth
        disabled={!confirmed}
        onClick={() => navigate('/settings')}
      >
        Continue to Account
      </Button>

      <Surface level="l1" style={{ marginTop: 20, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <AlertTriangle size={14} style={{ color: 'var(--hsn-accent-orange)' }} />
          <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
            Recommended storage
          </Typography>
        </div>
        <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
          <li><Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>Print it out and store in a safe</Typography></li>
          <li><Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>Save in a password manager</Typography></li>
          <li><Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>Write it down and keep with important documents</Typography></li>
        </ul>
      </Surface>
    </AuthLayout>
  );
}
