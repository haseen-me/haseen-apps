import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { InputField, Input, InputType, Banner, Button, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
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

  const handleSubmit = async (e?: FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e?.preventDefault();

    if (!validate({ name, email, password, confirmPassword })) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

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
        password,
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
        console.info('[Dev] Verification URL:', response.verifyUrl);
        toast.show('Please verify your email using the link sent to your inbox.', { countdown: 6 });
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
      {error && (
        <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
          {error}
        </Banner>
      )}

      <form onSubmit={handleSubmit}>
        <InputField label="Full name" error={!!fieldErrors['name']} subText={fieldErrors['name']} style={{ marginBottom: 14 }}>
          <Input
            type={InputType.TEXT}
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            startIcon={<User size={16} />}
            autoComplete="name"
            error={!!fieldErrors['name']}
          />
        </InputField>

        <InputField label="Email address" error={!!fieldErrors['email']} subText={fieldErrors['email']} style={{ marginBottom: 14 }}>
          <Input
            type={InputType.EMAIL}
            placeholder="john@haseen.me"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail size={16} />}
            autoComplete="email"
            error={!!fieldErrors['email']}
          />
        </InputField>

        <InputField label="Password" error={!!fieldErrors['password']} subText={fieldErrors['password']} style={{ marginBottom: 14 }}>
          <Input
            type={InputType.PASSWORD}
            placeholder="At least 10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock size={16} />}
            autoComplete="new-password"
            error={!!fieldErrors['password']}
          />
        </InputField>

        <InputField label="Confirm password" error={!!fieldErrors['confirm']} subText={fieldErrors['confirm']} style={{ marginBottom: 14 }}>
          <Input
            type={InputType.PASSWORD}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            startIcon={<Lock size={16} />}
            autoComplete="new-password"
            error={!!fieldErrors['confirm']}
          />
        </InputField>

        <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', lineHeight: 1.5, marginBottom: 16 }}>
          Your vault keys stay on this device. The server stores only Argon2-hashed credentials and your public keys.
        </Typography>

        {status && (
          <Typography size={TypographySize.CAPTION} style={{ marginBottom: 10, color: 'var(--hsn-text-tertiary)', textAlign: 'center' }}>
            {status}
          </Typography>
        )}

        <Button
          type={Type.PRIMARY}
          size={Size.LARGE}
          fullWidth
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          {loading ? status || 'Creating Account…' : 'Create Account'}
        </Button>
      </form>

      <Typography size={TypographySize.BODY} style={{ textAlign: 'center', color: 'var(--hsn-text-secondary)', marginTop: 16 }}>
        Already have an account?{' '}
        <Link to="/sign-in" style={{ color: 'var(--hsn-accent-teal)' }}>Sign in</Link>
      </Typography>
    </AuthLayout>
  );
}
