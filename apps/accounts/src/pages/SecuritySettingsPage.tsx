import { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, AlertTriangle, Check, Trash2, Monitor, X } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Button, FormField, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

export function SecuritySettingsPage() {
  const { user, setUser } = useAuthStore();
  const [mfaStep, setMfaStep] = useState<'idle' | 'setup' | 'verify'>('idle');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaOtpAuthUrl, setMfaOtpAuthUrl] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; userAgent: string; ipAddress: string; createdAt: string; current?: boolean }>>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleEnableMfa = async () => {
    setMfaLoading(true);
    setMfaError(null);
    try {
      const { secret, otpAuthUrl } = await authApi.setupMfa();
      setMfaSecret(secret);
      setMfaOtpAuthUrl(otpAuthUrl);
      setMfaStep('setup');
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Failed to setup MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaCode.length !== 6 || !user) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      await authApi.verifyMfa(mfaCode);
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
    if (!user) return;
    setMfaLoading(true);
    setMfaError(null);
    try {
      await authApi.disableMfa();
      setUser({ ...user, mfaEnabled: false });
    } catch (err) {
      setMfaError(err instanceof Error ? err.message : 'Failed to disable MFA');
    } finally {
      setMfaLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 10 || newPassword !== confirmPassword) return;
    setPwLoading(true);
    setPwError(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
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

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await authApi.listSessions();
      setSessions(data);
    } catch {
      // silently fail — sessions will show empty
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionID: string) => {
    setRevokingId(sessionID);
    try {
      await authApi.revokeSession(sessionID);
      setSessions((prev) => prev.filter((s) => s.id !== sessionID));
    } catch {
      // ignore
    } finally {
      setRevokingId(null);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

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
            {mfaOtpAuthUrl ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaOtpAuthUrl)}`}
                alt="MFA QR Code"
                width={200}
                height={200}
                style={{
                  border: '1px solid var(--acc-border)',
                  borderRadius: 'var(--acc-radius-sm)',
                  margin: '16px 0',
                }}
              />
            ) : (
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
                Loading QR code...
              </div>
            )}
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
          Manage your active sessions across devices.
        </p>
        {sessionsLoading ? (
          <p style={{ fontSize: 13, color: 'var(--acc-text-muted)' }}>Loading sessions...</p>
        ) : sessions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--acc-text-muted)' }}>No active sessions found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map((session) => (
              <div
                key={session.id}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Monitor size={16} style={{ color: 'var(--acc-text-muted)' }} />
                  <div>
                    <strong>
                      {session.userAgent || 'Unknown device'}
                      {session.current ? ' (This device)' : ''}
                    </strong>
                    <p style={{ color: 'var(--acc-text-muted)', fontSize: 12, marginTop: 2 }}>
                      {session.ipAddress || 'Unknown IP'} · Created {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                  title="Revoke session"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--acc-danger, #dc3545)',
                    padding: 4,
                    borderRadius: 4,
                    opacity: revokingId === session.id ? 0.5 : 1,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
