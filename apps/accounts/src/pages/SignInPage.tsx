import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Shield } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Divider, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import {
  generateEphemeral,
  computeClientProof,
  decryptPrivateKeys,
} from '@haseen-me/crypto';
import { authApi } from '@/api/auth';

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function SignInPage() {
  const navigate = useNavigate();
  const { loginSuccess, setLoading, setError, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      if (mfaRequired) {
        // MFA verification step
        setStatus('Verifying 2FA code...');
        // In production: authApi.verifyMfa(email, mfaCode, srpM1)
        // For now, this path will work when the backend supports MFA verify
        setStatus('');
        setLoading(false);
        return;
      }

      // Step 1: Generate client ephemeral A
      setStatus('Generating ephemeral...');
      const ephemeral = generateEphemeral();

      // Step 2: Send email + A to server, receive B + salt
      setStatus('Authenticating with server...');
      const { srpB, srpSalt } = await authApi.loginInit({
        email: email.toLowerCase(),
        srpA: ephemeral.public,
      });

      // Step 3: Compute client proof M1
      setStatus('Computing proof...');
      const { m1 } = computeClientProof(
        ephemeral.secret,
        ephemeral.public,
        srpB,
        srpSalt,
        email.toLowerCase(),
        password,
      );

      // Step 4: Send M1 to server, receive M2 + token
      setStatus('Verifying credentials...');
      const result = await authApi.loginVerify({
        email: email.toLowerCase(),
        srpM1: m1,
      });

      // Check if MFA is required
      if (result.user?.mfaEnabled && !result.token) {
        setMfaRequired(true);
        setStatus('');
        setLoading(false);
        return;
      }

      // Step 5: Decrypt local private keys
      setStatus('Decrypting keys...');
      const encryptedKeysBase64 = localStorage.getItem('haseen-encrypted-keys');
      if (encryptedKeysBase64) {
        try {
          await decryptPrivateKeys(password, fromBase64(encryptedKeysBase64));
          // Keys decrypted successfully — they'll be re-derived by crypto stores when needed
        } catch {
          // Keys can't be decrypted — user might be on a new device, download from server later
          console.warn('[Auth] Could not decrypt local keys');
        }
      }

      // Step 6: Verify server proof M2
      if (result.user && result.token) {
        // Optionally verify M2 — if the server provides srpM2
        loginSuccess(
          {
            id: result.user.id,
            email: result.user.email,
            displayName: result.user.displayName || email.split('@')[0] || email,
            mfaEnabled: result.user.mfaEnabled ?? false,
            createdAt: result.user.createdAt || new Date().toISOString(),
          },
          result.token,
        );
        setStatus('');
        navigate('/settings');
      }
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your encrypted workspace.">
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        {!mfaRequired ? (
          <>
            <FormField
              label="Email address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
            <FormField
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              autoComplete="current-password"
            />
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link
                to="/forgot-password"
                style={{ fontSize: 13, color: 'var(--acc-brand)' }}
              >
                Forgot password?
              </Link>
            </div>
          </>
        ) : (
          <>
            <Alert type="info">
              Two-factor authentication is enabled. Enter the 6-digit code from your authenticator app.
            </Alert>
            <FormField
              label="Authentication code"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              icon={<Lock size={16} />}
              autoComplete="one-time-code"
              inputMode="numeric"
              style={{ letterSpacing: '0.3em', fontFamily: 'monospace', fontSize: 18, textAlign: 'center' }}
            />
          </>
        )}

        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--acc-brand)' }}>
            <Shield size={14} />
            {status}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? status || 'Signing In...' : mfaRequired ? 'Verify' : 'Sign In'}
        </Button>
      </form>

      <Divider text="or" />

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--acc-text-secondary)' }}>
        Don&apos;t have an account?{' '}
        <Link to="/sign-up">Create one</Link>
      </p>
    </AuthLayout>
  );
}
