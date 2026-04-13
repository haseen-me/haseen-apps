import { useState, useEffect } from 'react';
import { Shield, Smartphone, Key, AlertTriangle, Trash2, Monitor, X } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { InputField, Input, InputType, Banner, Button, CodeInput, CodeInputType, Chip, ChipSize, Skeleton, Surface, Typography, TypographySize, TypographyWeight, MonoTag, IconButton, Type, Size } from '@haseen-me/ui';
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
      // silently fail
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

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <SettingsLayout activeTab="/settings/security">
      <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 4 }}>
        Security
      </Typography>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 32 }}>
        Manage your password and two-factor authentication.
      </Typography>

      {/* Password */}
      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Key size={18} style={{ color: 'var(--hsn-accent-teal)' }} />
          <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Password</Typography>
        </div>
        <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
          Your password is used to derive encryption keys locally. It is never sent to our servers.
        </Typography>

        {pwSuccess && <Banner color="success" style={{ marginBottom: 12, borderRadius: 8 }}>Password updated successfully.</Banner>}
        {pwError && <Banner color="error" style={{ marginBottom: 12, borderRadius: 8 }}>{pwError}</Banner>}

        {!showPasswordChange ? (
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={() => setShowPasswordChange(true)}>
            Change password
          </Button>
        ) : (
          <div style={{ maxWidth: 360 }}>
            <InputField label="Current password" style={{ marginBottom: 14 }}>
              <Input type={InputType.PASSWORD} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </InputField>
            <InputField label="New password" style={{ marginBottom: 14 }}>
              <Input type={InputType.PASSWORD} placeholder="At least 10 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </InputField>
            <InputField label="Confirm new password" error={passwordMismatch} subText={passwordMismatch ? 'Passwords do not match' : undefined} style={{ marginBottom: 16 }}>
              <Input type={InputType.PASSWORD} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" error={passwordMismatch} />
            </InputField>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handlePasswordChange} disabled={newPassword.length < 10 || newPassword !== confirmPassword} loading={pwLoading}>
                Update password
              </Button>
              <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={() => setShowPasswordChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Surface>

      {/* MFA */}
      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Smartphone size={18} style={{ color: 'var(--hsn-accent-teal)' }} />
            <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Two-Factor Authentication</Typography>
          </div>
          {user?.mfaEnabled && (
            <Chip
              label="✓ Enabled"
              size={ChipSize.SMALL}
              style={{ background: 'var(--hsn-accent-green-secondary)', color: 'var(--hsn-accent-green-primary)' }}
            />
          )}
        </div>
        <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
          Add an extra layer of security by requiring a code from your authenticator app when signing in.
        </Typography>

        {mfaError && <Banner color="error" style={{ marginBottom: 12, borderRadius: 8 }}>{mfaError}</Banner>}

        {mfaStep === 'idle' && !user?.mfaEnabled && (
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handleEnableMfa} loading={mfaLoading} startIcon={<Shield size={16} />}>
            Enable 2FA
          </Button>
        )}

        {mfaStep === 'setup' && (
          <div>
            <Banner color="info" style={{ marginBottom: 16, borderRadius: 8 }}>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </Banner>
            {mfaOtpAuthUrl ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaOtpAuthUrl)}`}
                alt="MFA QR Code"
                width={200}
                height={200}
                style={{ border: '1px solid var(--hsn-border-primary)', borderRadius: 8, margin: '16px 0', display: 'block' }}
              />
            ) : (
              <Skeleton style={{ width: 200, height: 200, borderRadius: 8, margin: '16px 0' }} />
            )}
            <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginBottom: 12 }}>
              Manual entry key: <MonoTag>{mfaSecret || 'Loading…'}</MonoTag>
            </Typography>
            <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={() => setMfaStep('verify')}>
              Next: Verify code
            </Button>
          </div>
        )}

        {mfaStep === 'verify' && (
          <div>
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
              Enter the 6-digit code from your authenticator app:
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 20 }}>
              <CodeInput
                length={6}
                type={CodeInputType.NUMERIC}
                onChange={setMfaCode}
                onComplete={(code: string) => { if (code.length === 6) handleVerifyMfa(); }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handleVerifyMfa} disabled={mfaCode.length !== 6} loading={mfaLoading}>
                Verify & Enable
              </Button>
              <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={() => { setMfaStep('idle'); setMfaCode(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {user?.mfaEnabled && mfaStep === 'idle' && (
          <Button type={Type.DESTRUCTIVE} size={Size.MEDIUM} onClick={handleDisableMfa} loading={mfaLoading} startIcon={<Trash2 size={14} />}>
            Disable 2FA
          </Button>
        )}
      </Surface>

      {/* Sessions */}
      <Surface level="l1" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <AlertTriangle size={18} style={{ color: 'var(--hsn-accent-orange)' }} />
          <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>Active Sessions</Typography>
        </div>
        <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
          Manage your active sessions across devices.
        </Typography>

        {sessionsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2].map((i) => <Skeleton key={i} style={{ height: 60, borderRadius: 8 }} />)}
          </div>
        ) : sessions.length === 0 ? (
          <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-tertiary)' }}>
            No active sessions found.
          </Typography>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map((session) => (
              <Surface key={session.id} level="l0" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Monitor size={16} style={{ color: 'var(--hsn-icon-secondary)' }} />
                  <div>
                    <Typography size={TypographySize.BODY} weight={TypographyWeight.MEDIUM}>
                      {session.userAgent || 'Unknown device'}{session.current ? ' (This device)' : ''}
                    </Typography>
                    <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 2 }}>
                      {session.ipAddress || 'Unknown IP'} · Created {new Date(session.createdAt).toLocaleDateString()}
                    </Typography>
                  </div>
                </div>
                <IconButton
                  icon={<X size={16} />}
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={revokingId === session.id}
                  type={Type.DESTRUCTIVE}
                  size={Size.SMALL}
                  tooltip="Revoke session"
                />
              </Surface>
            ))}
          </div>
        )}
      </Surface>
    </SettingsLayout>
  );
}
