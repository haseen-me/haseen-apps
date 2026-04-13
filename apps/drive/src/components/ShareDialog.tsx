import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Dialog, InputField, Input, InputType, Button, Chip, ChipSize, Select, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import type { SelectOption } from '@haseen-me/ui';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';

type Permission = 'read' | 'write';

const PERMISSION_OPTIONS: SelectOption[] = [
  { label: 'Can view', value: 'read' },
  { label: 'Can edit', value: 'write' },
];

export function ShareDialog() {
  const { files, shareDialogFileId, setShareDialogFileId } = useDriveStore();
  const toast = useToastStore();
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('read');
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState<Array<{ email: string; permission: Permission }>>([]);

  const file = files.find((f) => f.id === shareDialogFileId);
  const isOpen = Boolean(file && shareDialogFileId);

  const handleShare = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) return;
    setSharing(true);
    try {
      await driveApi.shareFile(file!.id, { email: trimmed, permission });
      setShared((prev) => [...prev, { email: trimmed, permission }]);
      setEmail('');
      toast.show(`Shared with ${trimmed}`);
    } catch {
      toast.show('Failed to share');
    } finally {
      setSharing(false);
    }
  };

  const handleClose = () => {
    setShareDialogFileId(null);
    setEmail('');
    setShared([]);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title={`Share "${file?.name ?? ''}"`}
      actions={
        <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={handleClose}>Done</Button>
      }
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
        <InputField label="Email address" style={{ flex: 1 }}>
          <Input
            type={InputType.EMAIL}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleShare(); }}
          />
        </InputField>
        <Select
          options={PERMISSION_OPTIONS}
          value={permission}
          onChange={(v) => setPermission(v as Permission)}
          style={{ width: 110 }}
        />
      </div>

      <Button
        type={Type.PRIMARY}
        size={Size.MEDIUM}
        fullWidth
        onClick={handleShare}
        disabled={!email.trim().includes('@') || sharing}
        loading={sharing}
        startIcon={<UserPlus size={15} />}
        style={{ marginBottom: shared.length > 0 ? 16 : 0 }}
      >
        Share
      </Button>

      {shared.length > 0 && (
        <div>
          <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
            Shared with
          </Typography>
          {shared.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--hsn-border-primary)' }}>
              <Typography size={TypographySize.BODY}>{s.email}</Typography>
              <Chip
                label={s.permission === 'read' ? 'Can view' : 'Can edit'}
                size={ChipSize.SMALL}
              />
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}
