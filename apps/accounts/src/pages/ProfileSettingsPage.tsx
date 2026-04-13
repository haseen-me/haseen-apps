import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Trash2 } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { FormField, Button, Alert } from '@/components/FormUI';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/api/auth';

export function ProfileSettingsPage() {
  const navigate = useNavigate();
  const { user, setUser, logout, fetchSession } = useAuthStore();
  const [name, setName] = useState(user?.displayName ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await authApi.updateAccount({ displayName: name.trim() });
      setUser({
        ...user,
        displayName: updated.displayName ?? name.trim(),
        email: updated.email,
      });
      await fetchSession();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== user?.email) return;
    setDeleting(true);
    try {
      await authApi.deleteAccount();
      await logout();
      navigate('/sign-in');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <SettingsLayout activeTab="/settings">
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Profile</h1>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 32 }}>
        Manage your personal information.
      </p>

      {saved && <Alert type="success">Profile updated successfully.</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {/* Avatar */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--acc-brand-subtle)',
              color: 'var(--acc-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 28,
              position: 'relative',
            }}
          >
            {user?.displayName?.charAt(0)?.toUpperCase() ?? <User size={28} />}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--acc-bg-card)',
                border: '1px solid var(--acc-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Camera size={12} style={{ color: 'var(--acc-text-muted)' }} />
            </div>
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{user?.displayName ?? 'User'}</p>
            <p style={{ fontSize: 13, color: 'var(--acc-text-muted)' }}>{user?.email ?? 'user@haseen.me'}</p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Personal Information</h3>
        <div style={{ maxWidth: 360 }}>
          <FormField
            label="Display name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            icon={<User size={16} />}
          />
          <FormField
            label="Email"
            value={user?.email ?? ''}
            disabled
            style={{ opacity: 0.6 }}
          />
          <p style={{ fontSize: 12, color: 'var(--acc-text-muted)', marginBottom: 16 }}>
            Email address cannot be changed as it is bound to your encryption keys.
          </p>
          <Button onClick={handleSave} disabled={!name.trim() || name === user?.displayName} loading={saving}>
            Save changes
          </Button>
        </div>
      </div>

      {/* Account info */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-border)',
          background: 'var(--acc-bg-card)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Account Details</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--acc-text-muted)' }}>Account ID</span>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{user?.id?.slice(0, 8) ?? '...'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--acc-text-muted)' }}>Created</span>
            <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '...'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--acc-text-muted)' }}>MFA</span>
            <span style={{ color: user?.mfaEnabled ? 'var(--acc-success)' : 'var(--acc-text-muted)' }}>
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div
        style={{
          padding: 24,
          borderRadius: 'var(--acc-radius)',
          border: '1px solid var(--acc-danger)',
          background: 'var(--acc-danger-subtle)',
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--acc-danger)', marginBottom: 8 }}>
          Danger Zone
        </h3>
        <p style={{ fontSize: 13, color: 'var(--acc-text-secondary)', marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDelete ? (
          <Button variant="danger" onClick={() => setShowDelete(true)}>
            <Trash2 size={14} /> Delete account
          </Button>
        ) : (
          <div style={{ maxWidth: 360 }}>
            <Alert type="error">
              This will permanently delete all your encrypted data, keys, and account information.
              Type your email to confirm.
            </Alert>
            <FormField
              label={`Type "${user?.email}" to confirm`}
              value={deleteConfirm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeleteConfirm(e.target.value)}
              placeholder={user?.email}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="danger"
                disabled={deleteConfirm !== user?.email}
                loading={deleting}
                onClick={handleDelete}
              >
                Permanently Delete
              </Button>
              <Button variant="secondary" onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
}
