import { AlertTriangle } from 'lucide-react';
import { Dialog, Button, Typography, TypographySize, Type, Size } from '@haseen-me/ui';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      actions={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={onCancel}>{cancelLabel}</Button>
          <Button type={danger ? Type.DESTRUCTIVE : Type.PRIMARY} size={Size.MEDIUM} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      }
    >
      {danger && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--hsn-accent-red-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={20} style={{ color: 'var(--hsn-accent-red)' }} />
          </div>
          <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>{message}</Typography>
        </div>
      )}
    </Dialog>
  );
}
