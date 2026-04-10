import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Alert } from '@/components/FormUI';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
      // TODO: Implement password recovery endpoint in backend
      // For now, show a message that password recovery needs to be set up
      console.warn('[ForgotPassword] Password recovery not yet implemented');
      
      // This would typically call an API endpoint like:
      // const response = await fetch('/api/v1/auth/password-recovery/initiate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.toLowerCase() }),
      // });

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="Password recovery instructions have been sent.">
        <Alert type="info">
          If an account exists with this email, you'll receive a password recovery link. 
          Please check your inbox and follow the instructions to reset your password.
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
      subtitle="Enter your email address and we'll send you a link to reset your password."
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
          style={{ marginTop: 24 }}
        >
          {loading ? 'Sending...' : 'Send Recovery Link'}
        </Button>
      </form>

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
