import { useState } from 'react';
import { Download, Mail, Users, Calendar, HardDrive, CheckCircle } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Button, CircularProgress, CircularProgressSize, Surface, Typography, TypographySize, TypographyWeight, Type, Size } from '@haseen-me/ui';

type ExportSection = 'mail' | 'contacts' | 'calendar' | 'drive';

interface ExportStatus {
  mail: 'idle' | 'exporting' | 'done' | 'error';
  contacts: 'idle' | 'exporting' | 'done' | 'error';
  calendar: 'idle' | 'exporting' | 'done' | 'error';
  drive: 'idle' | 'exporting' | 'done' | 'error';
}

const SECTIONS: { key: ExportSection; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'mail', label: 'Mail', icon: <Mail size={20} />, desc: 'Export all messages as JSON' },
  { key: 'contacts', label: 'Contacts', icon: <Users size={20} />, desc: 'Export contacts as CSV' },
  { key: 'calendar', label: 'Calendar', icon: <Calendar size={20} />, desc: 'Export events as JSON' },
  { key: 'drive', label: 'Drive', icon: <HardDrive size={20} />, desc: 'Export file metadata as JSON' },
];

function downloadBlob(data: string, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataExportPage() {
  const [selected, setSelected] = useState<Set<ExportSection>>(new Set());
  const [status, setStatus] = useState<ExportStatus>({ mail: 'idle', contacts: 'idle', calendar: 'idle', drive: 'idle' });
  const [exporting, setExporting] = useState(false);

  const toggle = (key: ExportSection) => {
    if (exporting) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const exportSection = async (key: ExportSection) => {
    setStatus((s) => ({ ...s, [key]: 'exporting' }));
    try {
      const now = new Date().toISOString().slice(0, 10);
      switch (key) {
        case 'mail': {
          const res = await fetch('/api/v1/mail/mailbox', { credentials: 'include' });
          const data = await res.json();
          downloadBlob(JSON.stringify(data, null, 2), `haseen-mail-export-${now}.json`, 'application/json');
          break;
        }
        case 'contacts': {
          const res = await fetch('/api/v1/contacts/contacts', { credentials: 'include' });
          const data = await res.json();
          const contacts = data.contacts || [];
          const csv = [
            'Name,Email,Phone,Company,Address,Birthday,Notes',
            ...contacts.map(
              (c: Record<string, string>) =>
                `"${(c.name || '').replace(/"/g, '""')}","${c.email || ''}","${c.phone || ''}","${c.company || ''}","${c.address || ''}","${c.birthday || ''}","${(c.notes || '').replace(/"/g, '""')}"`,
            ),
          ].join('\n');
          downloadBlob(csv, `haseen-contacts-export-${now}.csv`, 'text/csv');
          break;
        }
        case 'calendar': {
          const res = await fetch('/api/v1/calendar/events', { credentials: 'include' });
          const data = await res.json();
          downloadBlob(JSON.stringify(data, null, 2), `haseen-calendar-export-${now}.json`, 'application/json');
          break;
        }
        case 'drive': {
          const res = await fetch('/api/v1/drive/files', { credentials: 'include' });
          const data = await res.json();
          downloadBlob(JSON.stringify(data, null, 2), `haseen-drive-export-${now}.json`, 'application/json');
          break;
        }
      }
      setStatus((s) => ({ ...s, [key]: 'done' }));
    } catch {
      setStatus((s) => ({ ...s, [key]: 'error' }));
    }
  };

  const handleExport = async () => {
    if (selected.size === 0) return;
    setExporting(true);
    for (const key of selected) {
      await exportSection(key);
    }
    setExporting(false);
  };

  const allDone = [...selected].every((k) => status[k] === 'done');

  return (
    <SettingsLayout activeTab="/settings/export">
      <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD} style={{ marginBottom: 6 }}>
        Export Your Data
      </Typography>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 24 }}>
        Download a copy of your data. Select the sections you want to export.
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SECTIONS.map(({ key, label, icon, desc }) => {
          const checked = selected.has(key);
          const st = status[key];
          return (
            <Surface
              key={key}
              level="l1"
              onClick={() => toggle(key)}
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: checked ? '1px solid var(--hsn-accent-teal)' : '1px solid var(--hsn-border-primary)',
                background: checked ? 'rgba(45, 184, 175, 0.06)' : undefined,
                cursor: exporting ? 'default' : 'pointer',
                opacity: exporting && !checked ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: checked ? 'var(--hsn-cta-primary-default)' : 'var(--hsn-bg-l0-solid)',
                  color: checked ? '#fff' : 'var(--hsn-icon-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <Typography size={TypographySize.BODY} weight={TypographyWeight.MEDIUM}>{label}</Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)' }}>{desc}</Typography>
              </div>
              {st === 'exporting' && <CircularProgress size={CircularProgressSize.SMALL} />}
              {st === 'done' && <CheckCircle size={18} style={{ color: 'var(--hsn-accent-green)' }} />}
              {st === 'error' && <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-accent-red)' }}>Failed</Typography>}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: checked ? '2px solid var(--hsn-accent-teal)' : '2px solid var(--hsn-border-primary)',
                  background: checked ? 'var(--hsn-cta-primary-default)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </Surface>
          );
        })}
      </div>

      <Button
        type={Type.PRIMARY}
        size={Size.MEDIUM}
        onClick={handleExport}
        disabled={selected.size === 0 || exporting}
        loading={exporting}
        startIcon={<Download size={16} />}
      >
        {exporting ? 'Exporting…' : allDone && selected.size > 0 ? 'Export Complete' : `Export ${selected.size} section${selected.size !== 1 ? 's' : ''}`}
      </Button>

      <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 16 }}>
        Exported files are downloaded directly to your device. No data is shared externally.
      </Typography>
    </SettingsLayout>
  );
}
