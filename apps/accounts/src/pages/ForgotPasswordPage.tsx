import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Alert } from '@/components/FormUI';
import { authApi } from '@/api/auth';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
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

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="If the account exists, we sent reset instructions.">
        <Alert type="info">
          Open your inbox and follow the reset link.
          {resetUrl ? (
            <>
              {' '}
              <a href={resetUrl} style={{ color: 'var(--acc-brand)' }}>
                Use the reset link now
              </a>
              .
            </>
          ) : null}
        </Alert>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link
            to="/sign-in"
            style={{
              color: 'var(--acc-brand)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter your account email to continue."
    >
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <FormField
          label="Email address"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={16} />}
          autoComplete="email"
        />

        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          fullWidth
          style={{ marginTop: 8 }}
        >
          {loading ? 'Sending...' : 'Send Recovery Link'}
        </Button>
      </form>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <Link
          to="/sign-in"
          style={{
            color: 'var(--acc-brand)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
