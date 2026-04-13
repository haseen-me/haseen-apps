import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Trash2 } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { InputField, Input, InputType, Banner, Button, Avatar, Surface, Typography, TypographySize, TypographyWeight, MonoTag, Type, Size } from '@haseen-me/ui';
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
      setUser({ ...user, displayName: updated.displayName ?? name.trim(), email: updated.email });
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
      <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 4 }}>
        Profile
      </Typography>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 32 }}>
        Manage your personal information.
      </Typography>

      {saved && <Banner color="success" style={{ marginBottom: 16, borderRadius: 8 }}>Profile updated successfully.</Banner>}
      {error && <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>{error}</Banner>}

      {/* Avatar card */}
      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar
            label={user?.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
            style={{ width: 72, height: 72, fontSize: 28 }}
          />
          <div>
            <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD}>
              {user?.displayName ?? 'User'}
            </Typography>
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-tertiary)' }}>
              {user?.email ?? 'user@haseen.me'}
            </Typography>
          </div>
        </div>
      </Surface>

      {/* Personal info */}
      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 16 }}>
          Personal Information
        </Typography>
        <div style={{ maxWidth: 360 }}>
          <InputField label="Display name" style={{ marginBottom: 14 }}>
            <Input
              type={InputType.TEXT}
              value={name}
              onChange={(e) => setName(e.target.value)}
              startIcon={<User size={16} />}
            />
          </InputField>
          <InputField label="Email" style={{ marginBottom: 8 }}>
            <Input
              type={InputType.EMAIL}
              value={user?.email ?? ''}
              disabled
            />
          </InputField>
          <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginBottom: 16 }}>
            Email address cannot be changed as it is bound to your encryption keys.
          </Typography>
          <Button
            type={Type.PRIMARY}
            size={Size.MEDIUM}
            onClick={handleSave}
            disabled={!name.trim() || name === user?.displayName}
            loading={saving}
          >
            Save changes
          </Button>
        </div>
      </Surface>

      {/* Account details */}
      <Surface level="l1" style={{ padding: 24, marginBottom: 20 }}>
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 12 }}>
          Account Details
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>Account ID</Typography>
            <MonoTag>{user?.id?.slice(0, 8) ?? '...'}</MonoTag>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>Created</Typography>
            <Typography size={TypographySize.BODY}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '...'}
            </Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>2FA</Typography>
            <Typography
              size={TypographySize.BODY}
              style={{ color: user?.mfaEnabled ? 'var(--hsn-accent-green)' : 'var(--hsn-text-tertiary)' }}
            >
              {user?.mfaEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </div>
        </div>
      </Surface>

      {/* Danger zone */}
      <Surface level="l1" style={{ padding: 24, border: '1px solid var(--hsn-accent-red)' }}>
        <Typography size={TypographySize.LARGE} weight={TypographyWeight.SEMIBOLD} style={{ color: 'var(--hsn-accent-red)', marginBottom: 8 }}>
          Danger Zone
        </Typography>
        <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 16 }}>
          Permanently delete your account and all associated data. This action cannot be undone.
        </Typography>

        {!showDelete ? (
          <Button type={Type.DESTRUCTIVE} size={Size.MEDIUM} onClick={() => setShowDelete(true)} startIcon={<Trash2 size={14} />}>
            Delete account
          </Button>
        ) : (
          <div style={{ maxWidth: 360 }}>
            <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>
              This will permanently delete all your encrypted data, keys, and account information. Type your email to confirm.
            </Banner>
            <InputField label={`Type "${user?.email}" to confirm`} style={{ marginBottom: 16 }}>
              <Input
                type={InputType.EMAIL}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user?.email}
              />
            </InputField>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                type={Type.DESTRUCTIVE}
                size={Size.MEDIUM}
                disabled={deleteConfirm !== user?.email}
                loading={deleting}
                onClick={handleDelete}
              >
                Permanently Delete
              </Button>
              <Button
                type={Type.SECONDARY}
                size={Size.MEDIUM}
                onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Surface>
    </SettingsLayout>
  );
}
