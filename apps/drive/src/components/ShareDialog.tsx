import { useState } from 'react';
import { X, Share2, UserPlus } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@/store/toast';
import { driveApi } from '@/api/client';

type Permission = 'read' | 'write';

export function ShareDialog() {
  const { files, shareDialogFileId, setShareDialogFileId } = useDriveStore();
  const toast = useToastStore();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('read');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState<Array<{ email: string; permission: Permission }>>([]);

  const file = files.find((f) => f.id === shareDialogFileId);
  if (!file) return null;

  const handleShare = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    setSharing(true);
    try {
      await driveApi.shareFile(file.id, { email: trimmed, permission });
      setShared((prev) => [...prev, { email: trimmed, permission }]);
      setEmail('');
      toast.show(`Shared with ${trimmed}`);
    } catch {
      toast.show('Failed to share');
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => setShareDialogFileId(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--drive-bg)',
          border: '1px solid var(--drive-border)',
          borderRadius: 'var(--drive-radius)',
          padding: 24,
          width: 420,
          maxWidth: '90vw',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={18} style={{ color: 'var(--drive-brand)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Share "{file.name}"</h3>
          </div>
          <button
            onClick={() => setShareDialogFileId(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--drive-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Email + permission input */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid var(--drive-border)',
              borderRadius: 'var(--drive-radius-sm)',
              background: 'var(--drive-bg)',
              color: 'var(--drive-text)',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <select
            value={permission}
            onChange={(e) => setPermission(e.target.value as Permission)}
            style={{
              padding: '8px 10px',
              border: '1px solid var(--drive-border)',
              borderRadius: 'var(--drive-radius-sm)',
              background: 'var(--drive-bg)',
              color: 'var(--drive-text)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <option value="read">Can view</option>
            <option value="write">Can edit</option>
          </select>
        </div>

        <button
          onClick={handleShare}
          disabled={!email.trim().includes('@') || sharing}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'var(--drive-brand)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--drive-radius-sm)',
            fontSize: 14,
            fontWeight: 500,
            cursor: !email.trim().includes('@') || sharing ? 'default' : 'pointer',
            opacity: !email.trim().includes('@') || sharing ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          <UserPlus size={15} />
          {sharing ? 'Sharing...' : 'Share'}
        </button>

        {/* Shared list */}
        {shared.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--drive-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Shared with
            </div>
            {shared.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--drive-bg-secondary, var(--drive-bg-hover))',
                  borderRadius: 'var(--drive-radius-sm)',
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                <span>{s.email}</span>
                <span style={{ fontSize: 12, color: 'var(--drive-text-muted)' }}>
                  {s.permission === 'read' ? 'Can view' : 'Can edit'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
