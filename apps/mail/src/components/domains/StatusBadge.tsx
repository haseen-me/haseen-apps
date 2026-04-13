import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#f5a623',
    bg: 'rgba(245, 166, 35, 0.12)',
    icon: Clock,
  },
  verifying: {
    label: 'Verifying',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
    icon: Loader2,
  },
  verified: {
    label: 'Verified',
    color: '#30a46c',
    bg: 'rgba(48, 164, 108, 0.12)',
    icon: CheckCircle2,
  },
  failed: {
    label: 'Failed',
    color: '#e5484d',
    bg: 'rgba(229, 72, 77, 0.12)',
    icon: AlertCircle,
  },
} as const;

export function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}22`,
      }}
    >
      <Icon
        size={14}
        style={status === 'verifying' ? { animation: 'spin 1s linear infinite' } : undefined}
      />
      {config.label}
    </motion.span>
  );
}

export function RecordStatus({ verified }: { verified: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: verified ? 'rgba(48, 164, 108, 0.15)' : 'rgba(229, 72, 77, 0.15)',
        flexShrink: 0,
      }}
    >
      {verified ? (
        <CheckCircle2 size={14} color="#30a46c" />
      ) : (
        <AlertCircle size={14} color="#e5484d" />
      )}
    </motion.div>
  );
}
