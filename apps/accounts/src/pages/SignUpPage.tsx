import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import {
  generateKeyPair,
  generateSigningKeyPair,
  encryptPrivateKeys,
  sign,
} from '@haseen-me/crypto';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function SignUpPage() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const { loginSuccess, setRecoveryKey, setLoading, setError, loading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const validate = (values: { name: string; email: string; password: string; confirmPassword: string }) => {
    const errs: Record<string, string> = {};
    if (!values.name.trim()) errs['name'] = 'Name is required';
    if (!values.email.trim()) errs['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs['email'] = 'Invalid email';
    else if (!values.email.trim().toLowerCase().endsWith('@haseen.me')) errs['email'] = 'Use your @haseen.me address';
    if (values.password.length < 10) errs['password'] = 'At least 10 characters (server policy)';
    if (values.password !== values.confirmPassword) errs['confirm'] = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const submittedName = String(formData.get('name') ?? name);
    const submittedEmail = String(formData.get('email') ?? email);
    const submittedPassword = String(formData.get('password') ?? password);
    const submittedConfirmPassword = String(formData.get('confirmPassword') ?? confirmPassword);

    if (!validate({
      name: submittedName,
      email: submittedEmail,
      password: submittedPassword,
      confirmPassword: submittedConfirmPassword,
    })) return;

    const normalizedEmail = submittedEmail.trim().toLowerCase();
    const normalizedName = submittedName.trim();

    setLoading(true);
    setError(null);

    try {
      setStatus('Generating encryption keys...');
      const encKP = generateKeyPair();
      const sigKP = generateSigningKeyPair();

      setStatus('Deriving key from password...');
      const encryptedKeys = await encryptPrivateKeys(password, encKP.secretKey, sigKP.secretKey);
      localStorage.setItem('haseen-encrypted-keys', toBase64(encryptedKeys));

      const selfSig = sign(encKP.publicKey, sigKP.secretKey).signature;

      setStatus('Creating account...');
      const response = await authApi.register({
        email: normalizedEmail,
        password: submittedPassword,
        displayName: normalizedName,
        publicKey: toBase64(encKP.publicKey),
        signingKey: toBase64(sigKP.publicKey),
        signature: toBase64(selfSig),
      });

      loginSuccess({
        id: response.user.id,
        email: response.user.email,
        displayName: response.user.displayName || normalizedName,
        mfaEnabled: false,
        isSuperAdmin: response.user.isSuperAdmin,
        createdAt: response.user.createdAt,
      });

      if (response.recoveryKey) {
        setRecoveryKey(response.recoveryKey);
      }

      setStatus('Publishing keys...');
      try {
        await fetch('/api/v1/keys/publish', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            encryptionPublicKey: toBase64(encKP.publicKey),
            signingPublicKey: toBase64(sigKP.publicKey),
            selfSignature: toBase64(selfSig),
          }),
        });
      } catch {
        console.warn('[SignUp] Could not publish keys to keyserver');
      }

      if (response.verifyUrl) {
        toast.show('Verify your email using the link shown on the next screen.', { countdown: 6 });
      }

      setStatus('');
      navigate('/recovery-key');
    } catch (err) {
      setStatus('');
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Set up your Haseen account.">
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Full name"
          name="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={16} />}
          error={fieldErrors['name']}
          autoComplete="name"
        />
        <FormField
          label="Email address"
          name="email"
          type="email"
          placeholder="john@haseen.me"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          error={fieldErrors['email']}
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="At least 10 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          error={fieldErrors['password']}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock size={16} />}
          error={fieldErrors['confirm']}
          autoComplete="new-password"
        />

        <div style={{ marginTop: 2, marginBottom: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--acc-text-muted)', lineHeight: 1.5 }}>
            Your vault keys stay on this device. The server stores only Argon2-hashed credentials and your public keys.
          </p>
        </div>

        {status && <p style={{ marginBottom: 10, fontSize: 12, color: 'var(--acc-text-muted)' }}>{status}</p>}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? status || 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--acc-text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/sign-in">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
