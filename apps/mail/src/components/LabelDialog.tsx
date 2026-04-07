import { useState } from 'react';
import { X } from 'lucide-react';
import { useMailStore } from '@/store/mail';
import { useToastStore } from '@haseen-me/shared/toast';
import { mailApi } from '@/api/client';

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

interface LabelDialogProps {
  open: boolean;
  onClose: () => void;
}

export function LabelDialog({ open, onClose }: LabelDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);
  const { userLabels, setUserLabels } = useMailStore();
  const toast = useToastStore();

  if (!open) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const label = await mailApi.createLabel({ name: name.trim(), color });
      setUserLabels([...userLabels, { id: label.id, name: label.name, color: label.color }]);
      toast.show('Label created');
      setName('');
      setColor(COLORS[0]);
      onClose();
    } catch {
      toast.show('Failed to create label');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (labelId: string) => {
    try {
      await mailApi.deleteLabel(labelId);
      setUserLabels(userLabels.filter((l) => l.id !== labelId));
      toast.show('Label deleted');
    } catch {
      toast.show('Failed to delete label');
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 200,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 360,
          background: 'var(--mail-bg)',
          borderRadius: 'var(--mail-radius)',
          boxShadow: 'var(--mail-shadow-lg)',
          border: '1px solid var(--mail-border)',
          zIndex: 201,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--mail-border)',
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Manage Labels</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', padding: 4, color: 'var(--mail-text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Create new label */}
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--mail-text)' }}>
            New label
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label name"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid var(--mail-border)',
              borderRadius: 'var(--mail-radius-sm)',
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              background: 'var(--mail-bg)',
              color: 'var(--mail-text)',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '2px solid var(--mail-text)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            style={{
              width: '100%',
              padding: '8px 0',
              borderRadius: 'var(--mail-radius-sm)',
              border: 'none',
              background: name.trim() ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: name.trim() ? 'pointer' : 'default',
            }}
          >
            {creating ? 'Creating...' : 'Create Label'}
          </button>
        </div>

        {/* Existing labels */}
        {userLabels.length > 0 && (
          <div style={{ borderTop: '1px solid var(--mail-border)', padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--mail-text)' }}>
              Your labels
            </div>
            {userLabels.map((label) => (
              <div
                key={label.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: label.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--mail-text)' }}>{label.name}</span>
                <button
                  onClick={() => handleDelete(label.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--mail-text-muted)',
                    padding: 2,
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
