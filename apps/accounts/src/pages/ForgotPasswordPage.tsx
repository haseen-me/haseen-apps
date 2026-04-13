import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { InputField, Input, InputType, Banner, Button, Type, Size } from '@haseen-me/ui';
import { authApi } from '@/api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authApi.forgotPassword(email.toLowerCase().trim());
      setResetUrl(res.resetUrl ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const backLink = (
    <div style={{ marginTop: 20, textAlign: 'center' }}>
      <Link to="/sign-in" style={{ color: 'var(--hsn-accent-teal)', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
    </div>
  );

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="If the account exists, we sent reset instructions.">
        <Banner color="info" style={{ marginBottom: 16, borderRadius: 8 }}>
          Open your inbox and follow the reset link.
          {resetUrl && (
            <> <a href={resetUrl} style={{ color: 'var(--hsn-accent-teal)' }}>Use the reset link now</a>.</>
          )}
        </Banner>
        {backLink}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your account email to continue.">
      {error && (
        <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
          {error}
        </Banner>
      )}

      <form onSubmit={handleSubmit}>
        <InputField label="Email address" style={{ marginBottom: 16 }}>
          <Input
            type={InputType.EMAIL}
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail size={16} />}
            autoComplete="email"
          />
        </InputField>

        <Button type={Type.PRIMARY} size={Size.LARGE} fullWidth onClick={handleSubmit} disabled={loading} loading={loading}>
          {loading ? 'Sending…' : 'Send Recovery Link'}
        </Button>
      </form>

      {backLink}
    </AuthLayout>
  );
}
