import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Chip, ChipSize } from '@haseen-me/ui';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'var(--hsn-accent-orange)', bg: 'var(--hsn-accent-orange-secondary)', icon: Clock },
  verifying: { label: 'Verifying', color: 'var(--hsn-accent-blue)', bg: 'var(--hsn-accent-blue-secondary)', icon: Loader2 },
  verified: { label: 'Verified', color: 'var(--hsn-accent-green)', bg: 'var(--hsn-accent-green-secondary)', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'var(--hsn-accent-red)', bg: 'var(--hsn-accent-red-secondary)', icon: AlertCircle },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Chip
      label={config.label}
      size={ChipSize.SMALL}
      style={{ background: config.bg, color: config.color, border: 'none' }}
    />
  );
}

export function RecordStatus({ verified }: { verified: boolean }) {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: verified ? 'var(--hsn-accent-green-secondary)' : 'var(--hsn-accent-red-secondary)',
        flexShrink: 0,
      }}
    >
      {verified ? (
        <CheckCircle2 size={14} style={{ color: 'var(--hsn-accent-green)' }} />
      ) : (
        <AlertCircle size={14} style={{ color: 'var(--hsn-accent-red)' }} />
      )}
    </div>
  );
}
