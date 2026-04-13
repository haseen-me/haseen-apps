import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, InputField, Input, InputType, Button, IconButton, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';
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
    <Dialog
      open={open}
      onClose={onClose}
      title="Manage Labels"
      actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handleCreate} disabled={!name.trim() || creating} loading={creating}>
            Create Label
          </Button>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={onClose}>Cancel</Button>
        </div>
      }
    >
      <div style={{ marginBottom: 20 }}>
        <InputField label="Label name" style={{ marginBottom: 12 }}>
          <Input
            type={InputType.TEXT}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            placeholder="Label name"
            autoFocus
          />
        </InputField>

        <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginBottom: 8 }}>
          Color
        </Typography>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c,
                border: color === c ? '2px solid var(--hsn-text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {userLabels.length > 0 && (
        <div style={{ borderTop: '1px solid var(--hsn-border-primary)', paddingTop: 16 }}>
          <Typography size={TypographySize.BODY} weight={TypographyWeight.MEDIUM} style={{ marginBottom: 10 }}>
            Your labels
          </Typography>
          {userLabels.map((label) => (
            <div key={label.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: label.color, flexShrink: 0 }} />
              <Typography size={TypographySize.BODY} style={{ flex: 1 }}>{label.name}</Typography>
              <IconButton
                icon={<X size={12} />}
                type={Type.TERTIARY}
                size={Size.SMALL}
                onClick={() => handleDelete(label.id)}
                tooltip="Delete label"
              />
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
