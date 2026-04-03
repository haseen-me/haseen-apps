import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Shield } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Divider, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import {
  generateKeyPair,
  generateSigningKeyPair,
  generateSalt,
  computeVerifier,
  encryptPrivateKeys,
  sign,
} from '@haseen-me/crypto';
import { authApi } from '@/api/auth';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function SignUpPage() {
  const navigate = useNavigate();
  const { loginSuccess, setRecoveryKey, setLoading, setError, loading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs['name'] = 'Name is required';
    if (!email.trim()) errs['email'] = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs['email'] = 'Invalid email';
    if (password.length < 8) errs['password'] = 'At least 8 characters';
    if (password !== confirmPassword) errs['confirm'] = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Generate NaCl key pairs on device
      setStatus('Generating encryption keys...');
      const encKP = generateKeyPair();
      const sigKP = generateSigningKeyPair();

      // 2. Encrypt private keys with password-derived key (PBKDF2)
      setStatus('Deriving key from password...');
      const encryptedKeys = await encryptPrivateKeys(
        password,
        encKP.secretKey,
        sigKP.secretKey,
      );

      // Store encrypted private keys locally
      localStorage.setItem('haseen-encrypted-keys', toBase64(encryptedKeys));

      // 3. Derive SRP verifier from password
      setStatus('Computing SRP verifier...');
      const srpSalt = generateSalt();
      const srpVerifier = computeVerifier(srpSalt, email.toLowerCase(), password);

      // 4. Create self-signature (sign public key with signing key)
      sign(encKP.publicKey, sigKP.secretKey);

      // 5. Register with server
      setStatus('Creating account...');
      const response = await authApi.register({
        email: email.toLowerCase(),
        srpSalt,
        srpVerifier,
        publicKey: bytesToHex(encKP.publicKey),
        signingKey: bytesToHex(sigKP.publicKey),
        encryptedPrivateKey: toBase64(encryptedKeys),
      });

      // 6. Store auth state with persistence
      loginSuccess(
        {
          id: response.user?.id ?? response.token,
          email: email.toLowerCase(),
          displayName: name,
          mfaEnabled: false,
          createdAt: new Date().toISOString(),
        },
        response.token,
      );

      if (response.recoveryKey) {
        setRecoveryKey(response.recoveryKey);
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
    <AuthLayout title="Create your account" subtitle="End-to-end encrypted. Zero-knowledge. Your data stays yours.">
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Full name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<User size={16} />}
          error={fieldErrors['name']}
          autoComplete="name"
        />
        <FormField
          label="Email address"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          error={fieldErrors['email']}
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={16} />}
          error={fieldErrors['password']}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<Lock size={16} />}
          error={fieldErrors['confirm']}
          autoComplete="new-password"
        />

        <div style={{ marginTop: 4, marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--acc-text-muted)', lineHeight: 1.5 }}>
            Your password is used to derive encryption keys on your device.
            We never receive or store your password.
          </p>
        </div>

        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--acc-brand)' }}>
            <Shield size={14} />
            {status}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} disabled={loading}>
          {loading ? status || 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <Divider text="or" />

      <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--acc-text-secondary)' }}>
        Already have an account?{' '}
        <Link to="/sign-in">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
