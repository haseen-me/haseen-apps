import { useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/layout/AuthLayout';
import { InputField, Input, InputType, Banner, Button, Type, Size } from '@haseen-me/ui';
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

  const passwordMismatch = confirm.length > 0 && newPassword !== confirm;
  const canSubmit = Boolean(token && newPassword.length >= 10 && newPassword === confirm);

  const handleSubmit = async (e?: FormEvent | React.MouseEvent) => {
    e?.preventDefault();
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
      {!token && (
        <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
          Missing reset token. Please restart the password reset flow.
        </Banner>
      )}
      {error && (
        <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
          {error}
        </Banner>
      )}

      <form onSubmit={handleSubmit}>
        <InputField label="New password" style={{ marginBottom: 14 }}>
          <Input
            type={InputType.PASSWORD}
            placeholder="At least 10 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            startIcon={<Lock size={16} />}
            autoComplete="new-password"
          />
        </InputField>

        <InputField
          label="Confirm new password"
          error={passwordMismatch}
          subText={passwordMismatch ? 'Passwords do not match' : undefined}
          style={{ marginBottom: 16 }}
        >
          <Input
            type={InputType.PASSWORD}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            startIcon={<Lock size={16} />}
            autoComplete="new-password"
            error={passwordMismatch}
          />
        </InputField>

        <Button type={Type.PRIMARY} size={Size.LARGE} fullWidth onClick={handleSubmit} disabled={!canSubmit || loading} loading={loading}>
          Reset password
        </Button>
      </form>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <Link to="/sign-in" style={{ color: 'var(--hsn-accent-teal)', textDecoration: 'none', fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
