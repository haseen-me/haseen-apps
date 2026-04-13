import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Fingerprint } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import { decryptPrivateKeys } from '@haseen-me/crypto';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();
  const { user, hydrated, fetchSession, loginSuccess, setLoading, setError, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const getSafeReturnTo = () => {
    const raw = new URLSearchParams(location.search).get('returnTo');
    if (!raw) return null;
    try {
      const parsed = new URL(raw, window.location.origin);
      if (parsed.origin !== window.location.origin) return null;
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return raw.startsWith('/') ? raw : null;
    }
  };

  const redirectAfterLogin = () => {
    const returnTo = getSafeReturnTo();
    if (returnTo) {
      window.location.assign(returnTo);
      return;
    }
    navigate('/settings');
  };

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (hydrated && user) {
      redirectAfterLogin();
    }
  }, [hydrated, user]);

  const tryDecryptKeys = async (pwd: string) => {
    const encryptedKeysBase64 = localStorage.getItem('haseen-encrypted-keys');
    if (!encryptedKeysBase64) return;
    try {
      await decryptPrivateKeys(pwd, fromBase64(encryptedKeysBase64));
    } catch {
      toast.show('Could not unlock local encryption keys. Check your password.', { countdown: 5 });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    setError(null);

    try {
      if (mfaToken) {
        if (!mfaCode.trim()) {
          setLoading(false);
          return;
        }
        setStatus('Verifying 2FA code...');
        const mfaResult = await authApi.loginMfa(mfaToken, mfaCode.trim());
        loginSuccess({
          id: mfaResult.user.id,
          email: mfaResult.user.email,
          displayName: mfaResult.user.displayName || normalizedEmail.split('@')[0] || '',
          mfaEnabled: true,
          isSuperAdmin: Boolean(mfaResult.user.isSuperAdmin),
          createdAt: mfaResult.user.createdAt || new Date().toISOString(),
        });
        await tryDecryptKeys(password);
        setMfaToken(null);
        setStatus('');
        toast.show('Signed in successfully');
        redirectAfterLogin();
        return;
      }

      setStatus('Signing in...');
      const result = await authApi.login(normalizedEmail, password);

      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
        setStatus('');
        setLoading(false);
        return;
      }

      loginSuccess({
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName || normalizedEmail.split('@')[0] || '',
        mfaEnabled: false,
        isSuperAdmin: Boolean(result.user.isSuperAdmin),
        createdAt: result.user.createdAt || new Date().toISOString(),
      });
      await tryDecryptKeys(password);
      setStatus('');
      toast.show('Signed in successfully');
      redirectAfterLogin();
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskey = async () => {
    if (!email.trim()) {
      setError('Enter your email to use a passkey');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    setLoading(true);
    setError(null);
    try {
      const opts = await authApi.webauthnLoginBegin(normalizedEmail);
      const assertion = await startAuthentication({ optionsJSON: opts as any });
      const result = await authApi.webauthnLoginFinish(assertion);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
        setLoading(false);
        return;
      }
      loginSuccess({
        id: result.user.id,
        email: result.user.email,
        displayName: result.user.displayName || normalizedEmail.split('@')[0] || '',
        mfaEnabled: false,
        isSuperAdmin: Boolean(result.user.isSuperAdmin),
        createdAt: result.user.createdAt || new Date().toISOString(),
      });
      toast.show('Signed in with passkey');
      redirectAfterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  if (!hydrated) {
    return (
      <AuthLayout title="Sign in" subtitle="Welcome back to Haseen.">
        <p style={{ textAlign: 'center', color: 'var(--acc-text-muted)' }}>Loading…</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to Haseen.">
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        {!mfaToken ? (
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
            <div style={{ textAlign: 'right', marginBottom: 12 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--acc-brand)' }}>
                Forgot password?
              </Link>
            </div>
            <Button type="button" variant="secondary" fullWidth onClick={handlePasskey} disabled={loading} style={{ marginBottom: 10 }}>
              <Fingerprint size={16} style={{ marginRight: 8 }} />
              Continue with passkey
            </Button>
          </>
        ) : (
          <>
            <Alert type="info">Enter your 6-digit authentication code.</Alert>
            <FormField
              label="Authenticator code"
              placeholder="000000"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
            />
          </>
        )}

        {status && <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--acc-text-muted)' }}>{status}</p>}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {mfaToken ? 'Verify & continue' : 'Sign in'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--acc-text-secondary)', marginTop: 16 }}>
        New here? <Link to="/sign-up">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
