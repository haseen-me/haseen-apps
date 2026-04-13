import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { Banner, Button, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

export function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToastStore();
  const [state, setState] = useState<'verifying' | 'ok' | 'error'>('verifying');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setState('error');
      setErr('Missing verification token.');
      return;
    }

    void authApi
      .verifyEmail(token)
      .then(() => {
        setState('ok');
        toast.show('Email verified.');
      })
      .catch((e) => {
        setState('error');
        setErr(e instanceof Error ? e.message : 'Verification failed.');
      });
  }, [location.search, toast]);

  if (state === 'verifying') {
    return (
      <AuthLayout title="Verifying your email" subtitle="Just a moment…">
        <Typography size={TypographySize.BODY} style={{ textAlign: 'center', color: 'var(--hsn-text-secondary)' }}>
          Verifying…
        </Typography>
      </AuthLayout>
    );
  }

  if (state === 'ok') {
    return (
      <AuthLayout title="Email verified" subtitle="Your account is ready.">
        <Banner color="success" icon={<CheckCircle2 size={16} />} style={{ marginBottom: 20, borderRadius: 8 }}>
          Your email has been verified.
        </Banner>
        <Button type={Type.PRIMARY} size={Size.LARGE} fullWidth onClick={() => navigate('/settings')}>
          Continue
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verification failed" subtitle="We could not verify this email.">
      <Banner color="error" icon={<XCircle size={16} />} style={{ marginBottom: 20, borderRadius: 8 }}>
        {err ?? 'Verification failed.'}
      </Banner>
      <div style={{ textAlign: 'center' }}>
        <Link to="/sign-in" style={{ color: 'var(--hsn-accent-teal)', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
