import { useState } from 'react';
import { Shield, Smartphone, Key, AlertTriangle, Check, Trash2 } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Button, FormField, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';
import { generateSalt, computeVerifier } from '@haseen-me/crypto';

export function SecuritySettingsPage() {
  const { user, token, setUser } = useAuthStore();
  const [mfaStep, setMfaStep] = useState<'idle' | 'setup' | 'verify'>('idle');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleEnableMfa = async () => {
    if (!token) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      const { secret } = await authApi.setupMfa(token);
      setMfaSecret(secret);
      setMfaStep('setup');
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Failed to setup MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaCode.length !== 6 || !user || !token) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      await authApi.verifyMfa(token, mfaCode);
      setUser({ ...user, mfaEnabled: true });
      setMfaStep('idle');
      setMfaCode('');
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!user || !token) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      await authApi.disableMfa(token);
      setUser({ ...user, mfaEnabled: false });
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8 || newPassword !== confirmPassword || !token || !user) return;
    setPwLoading(true);
    setPwError(null);
    try {
      const salt = generateSalt();
      const verifier = computeVerifier(salt, user.email, newPassword);
      await authApi.updateAccount(token, { srpSalt: salt, srpVerifier: verifier });
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <SettingsLayout activeTab="/settings/security">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Security</h1>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 32 }}>
        Manage your password and two-factor authentication.
      </p>

      {/* Password section */}
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
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Password</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--acc-text-secondary)', marginBottom: 16 }}>
          Your password is used to derive encryption keys locally. It is never sent to our servers.
        </p>

        {pwSuccess && <Alert type="success">Password updated successfully.</Alert>}
        {pwError && <Alert type="error">{pwError}</Alert>}

        {!showPasswordChange ? (
          <Button variant="secondary" onClick={() => setShowPasswordChange(true)}>
            Change password
          </Button>
        ) : (
          <div style={{ maxWidth: 360 }}>
            <FormField
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
            <FormField
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <FormField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
              autoComplete="new-password"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handlePasswordChange} disabled={newPassword.length < 8 || newPassword !== confirmPassword} loading={pwLoading}>
                Update password
              </Button>
              <Button variant="secondary" onClick={() => setShowPasswordChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* MFA section */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Smartphone size={18} style={{ color: 'var(--acc-brand)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Two-Factor Authentication</h3>
          </div>
          {user?.mfaEnabled && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--acc-success)',
                background: 'rgba(48,164,108,0.08)',
                padding: '4px 10px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Check size={12} /> Enabled
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--acc-text-secondary)', marginBottom: 16 }}>
          Add an extra layer of security by requiring a code from your authenticator app when signing in.
        </p>

        {mfaError && <Alert type="error">{mfaError}</Alert>}

        {mfaStep === 'idle' && !user?.mfaEnabled && (
          <Button onClick={handleEnableMfa} loading={mfaLoading}>
            <Shield size={16} /> Enable 2FA
          </Button>
        )}

        {mfaStep === 'setup' && (
          <div>
            <Alert type="info">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Alert>
            <div
              style={{
                width: 200,
                height: 200,
                background: 'var(--acc-bg)',
                border: '1px solid var(--acc-border)',
                borderRadius: 'var(--acc-radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '16px 0',
                fontSize: 12,
                color: 'var(--acc-text-muted)',
              }}
            >
              QR code placeholder
            </div>
            <p style={{ fontSize: 12, color: 'var(--acc-text-muted)', marginBottom: 12 }}>
              Manual entry key: <code style={{ background: 'var(--acc-bg)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{mfaSecret || 'Loading...'}</code>
            </p>
            <Button onClick={() => setMfaStep('verify')}>
              Next: Verify code
            </Button>
          </div>
        )}

        {mfaStep === 'verify' && (
          <div style={{ maxWidth: 300 }}>
            <FormField
              label="Enter 6-digit code"
              placeholder="000000"
              value={mfaCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              style={{ letterSpacing: '0.3em', fontFamily: 'monospace', fontSize: 18, textAlign: 'center' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handleVerifyMfa} disabled={mfaCode.length !== 6} loading={mfaLoading}>
                Verify & Enable
              </Button>
              <Button variant="secondary" onClick={() => { setMfaStep('idle'); setMfaCode(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {user?.mfaEnabled && mfaStep === 'idle' && (
          <Button variant="danger" onClick={handleDisableMfa} loading={mfaLoading}>
            <Trash2 size={14} /> Disable 2FA
          </Button>
        )}
      </div>

      {/* Sessions */}
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
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Active Sessions</h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--acc-text-secondary)', marginBottom: 16 }}>
          You are currently signed in on this device.
        </p>
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--acc-radius-sm)',
            background: 'var(--acc-bg)',
            border: '1px solid var(--acc-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
          }}
        >
          <div>
            <strong>Current session</strong>
            <p style={{ color: 'var(--acc-text-muted)', fontSize: 12, marginTop: 2 }}>
              Web browser · Active now
            </p>
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'var(--acc-success)',
              fontWeight: 600,
              background: 'rgba(48,164,108,0.08)',
              padding: '3px 8px',
              borderRadius: 8,
            }}
          >
            Current
          </span>
        </div>
      </div>
    </SettingsLayout>
  );
}
