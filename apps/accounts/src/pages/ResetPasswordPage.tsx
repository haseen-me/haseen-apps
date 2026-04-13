import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { FormField, Button, Alert } from '@/components/FormUI';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastStore();

  const token = useMemo(() => new URLSearchParams(location.search).get('token') ?? '', [location.search]);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = token && newPassword.length >= 10 && newPassword === confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
      toast.show('Password reset successfully. Please sign in.', { countdown: 5 });
      navigate('/sign-in', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password to continue.">
      {!token ? (
        <Alert type="error">
          Missing reset token. Please restart the password reset flow.
        </Alert>
      ) : null}

      {error ? <Alert type="error">{error}</Alert> : null}

      <form onSubmit={handleSubmit}>
        <FormField
          label="New password"
          type="password"
          placeholder="At least 10 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          icon={<Lock size={16} />}
          autoComplete="new-password"
        />
        <FormField
          label="Confirm new password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={<Lock size={16} />}
          autoComplete="new-password"
          error={confirm && newPassword !== confirm ? 'Passwords do not match' : undefined}
        />
        <Button type="submit" fullWidth disabled={!canSubmit || loading} loading={loading} style={{ marginTop: 8 }}>
          Reset password
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

