import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Divider, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';

export function SignInPage() {
  const navigate = useNavigate();
  const { setUser, setToken, setLoading, setError, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setLoading(true);
    setError(null);

    try {
      // In production, this would:
      // 1. Call authApi.loginInit() with email + SRP A value
      // 2. Compute SRP proof from server's B value + salt
      // 3. Call authApi.loginVerify() with SRP M1 proof
      // 4. If MFA enabled, show MFA input and call authApi.verifyMfa()
      // For now, simulate success:
      if (email === 'mfa@example.com' && !mfaRequired) {
        setMfaRequired(true);
        setLoading(false);
        return;
      }

      const mockUser = {
        id: crypto.randomUUID(),
        email,
        displayName: email.split('@')[0] ?? email,
        mfaEnabled: mfaRequired,
        createdAt: new Date().toISOString(),
      };
      setUser(mockUser);
      setToken('mock-token-' + mockUser.id);
      navigate('/settings');
    } catch (err) {
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

        <Button type="submit" fullWidth loading={loading}>
          {mfaRequired ? 'Verify' : 'Sign In'}
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
