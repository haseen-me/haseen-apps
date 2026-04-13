import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock, Fingerprint } from 'lucide-react';
import { startAuthentication } from '@simplewebauthn/browser';
import { AuthLayout } from '@/layout/AuthLayout';
import { InputField, Input, InputType, Banner, Button, Divider, CodeInput, CodeInputType, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
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

  const handleSubmit = async (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();
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
        <Typography size={TypographySize.BODY} style={{ textAlign: 'center', color: 'var(--hsn-text-secondary)' }}>
          Loading…
        </Typography>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to Haseen.">
      {error && (
        <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
          {error}
        </Banner>
      )}

      <form onSubmit={handleSubmit}>
        {!mfaToken ? (
          <>
            <InputField label="Email address" style={{ marginBottom: 14 }}>
              <Input
                type={InputType.EMAIL}
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startIcon={<Mail size={16} />}
                autoComplete="email"
              />
            </InputField>

            <InputField label="Password" style={{ marginBottom: 8 }}>
              <Input
                type={InputType.PASSWORD}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startIcon={<Lock size={16} />}
                autoComplete="current-password"
              />
            </InputField>

            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--hsn-accent-teal)' }}>
                Forgot password?
              </Link>
            </div>

            <Button
              type={Type.SECONDARY}
              size={Size.MEDIUM}
              fullWidth
              onClick={handlePasskey}
              disabled={loading}
              startIcon={<Fingerprint size={16} />}
              style={{ marginBottom: 10 }}
            >
              Continue with passkey
            </Button>
          </>
        ) : (
          <>
            <Banner color="info" style={{ marginBottom: 16, borderRadius: 8 }}>
              Enter your 6-digit authentication code.
            </Banner>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <CodeInput
                length={6}
                type={CodeInputType.NUMERIC}
                onChange={setMfaCode}
                autoFocus
              />
            </div>
          </>
        )}

        {status && (
          <Typography size={TypographySize.CAPTION} style={{ marginBottom: 10, color: 'var(--hsn-text-tertiary)', textAlign: 'center' }}>
            {status}
          </Typography>
        )}

        <Divider />

        <Button
          type={Type.PRIMARY}
          size={Size.LARGE}
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {mfaToken ? 'Verify & continue' : 'Sign in'}
        </Button>
      </form>

      <Typography size={TypographySize.BODY} style={{ textAlign: 'center', color: 'var(--hsn-text-secondary)', marginTop: 16 }}>
        New here? <Link to="/sign-up" style={{ color: 'var(--hsn-accent-teal)' }}>Create an account</Link>
      </Typography>
    </AuthLayout>
  );
}
