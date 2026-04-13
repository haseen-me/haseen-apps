import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Surface, MonoTag, Typography, TypographySize, TypographyWeight } from '@haseen-me/ui';
import { RecordStatus } from './StatusBadge';
import type { DNSRecord } from '@/types/domain';

interface DNSRecordCardProps {
  record: DNSRecord;
  label: string;
  description: string;
  index: number;
}

export function DNSRecordCard({ record, label, description, index }: DNSRecordCardProps) {
  const [copied, setCopied] = useState<'host' | 'value' | null>(null);

  const copyToClipboard = (text: string, field: 'host' | 'value') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Surface level="l1" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RecordStatus verified={record.verified} />
            <div>
              <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>{label}</Typography>
              <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 1 }}>{description}</Typography>
            </div>
          </div>
          <MonoTag>{record.type}</MonoTag>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CopyableField label="Host" value={record.host} copied={copied === 'host'} onCopy={() => copyToClipboard(record.host, 'host')} />
          <CopyableField label="Value" value={record.value} copied={copied === 'value'} onCopy={() => copyToClipboard(record.value, 'value')} mono />
        </div>
      </Surface>
    </motion.div>
  );
}

function CopyableField({ label, value, copied, onCopy, mono }: {
  label: string; value: string; copied: boolean; onCopy: () => void; mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', fontWeight: 500 }}>{label}</Typography>
      <Surface level="l0" onClick={onCopy} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
        <code style={{ flex: 1, fontSize: 12, color: 'var(--hsn-text-primary)', fontFamily: mono ? "'JetBrains Mono', 'Fira Code', monospace" : 'inherit', wordBreak: 'break-all', lineHeight: 1.5 }}>
          {value}
        </code>
        <motion.div key={copied ? 'check' : 'copy'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ flexShrink: 0 }}>
          {copied ? <Check size={14} style={{ color: 'var(--hsn-accent-green)' }} /> : <Copy size={14} style={{ color: 'var(--hsn-icon-secondary)' }} />}
        </motion.div>
      </Surface>
    </div>
  );
}
