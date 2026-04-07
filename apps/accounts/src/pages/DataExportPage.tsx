import { useState } from 'react';
import { Download, Mail, Users, Calendar, HardDrive, Loader2, CheckCircle } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { useAuthStore } from '@/store/auth';

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
  const { token } = useAuthStore();
  const [selected, setSelected] = useState<Set<ExportSection>>(new Set());
  const [status, setStatus] = useState<ExportStatus>({
    mail: 'idle',
    contacts: 'idle',
    calendar: 'idle',
    drive: 'idle',
  });
  const [exporting, setExporting] = useState(false);

  const toggle = (key: ExportSection) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const exportSection = async (key: ExportSection) => {
    setStatus((s) => ({ ...s, [key]: 'exporting' }));
    try {
      const now = new Date().toISOString().slice(0, 10);
      switch (key) {
        case 'mail': {
          const res = await fetch('/api/v1/mail/mailbox', { credentials: 'include', headers });
          const data = await res.json();
          downloadBlob(JSON.stringify(data, null, 2), `haseen-mail-export-${now}.json`, 'application/json');
          break;
        }
        case 'contacts': {
          const res = await fetch('/api/v1/contacts/contacts', { credentials: 'include', headers });
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
          const res = await fetch('/api/v1/calendar/events', { credentials: 'include', headers });
          const data = await res.json();
          downloadBlob(JSON.stringify(data, null, 2), `haseen-calendar-export-${now}.json`, 'application/json');
          break;
        }
        case 'drive': {
          const res = await fetch('/api/v1/drive/files', { credentials: 'include', headers });
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
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Export Your Data</h2>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 24 }}>
        Download a copy of your data. Select the sections you want to export.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {SECTIONS.map(({ key, label, icon, desc }) => {
          const checked = selected.has(key);
          const st = status[key];
          return (
            <label
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 16px',
                borderRadius: 10,
                border: checked ? '1px solid var(--acc-brand)' : '1px solid var(--acc-border)',
                background: checked ? 'var(--acc-brand-subtle, rgba(45,184,175,0.06))' : 'var(--acc-bg-card)',
                cursor: exporting ? 'default' : 'pointer',
                transition: 'all 0.15s',
                opacity: exporting && !checked ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(key)}
                disabled={exporting}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: checked ? 'var(--acc-brand)' : 'var(--acc-bg)',
                  color: checked ? '#fff' : 'var(--acc-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--acc-text)' }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--acc-text-muted)' }}>{desc}</div>
              </div>
              {st === 'exporting' && <Loader2 size={18} style={{ color: 'var(--acc-brand)', animation: 'spin 1s linear infinite' }} />}
              {st === 'done' && <CheckCircle size={18} style={{ color: 'var(--acc-success, #30a46c)' }} />}
              {st === 'error' && <span style={{ fontSize: 12, color: 'var(--acc-danger, #e5484d)' }}>Failed</span>}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  border: checked ? '2px solid var(--acc-brand)' : '2px solid var(--acc-border)',
                  background: checked ? 'var(--acc-brand)' : 'transparent',
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
            </label>
          );
        })}
      </div>

      <button
        onClick={handleExport}
        disabled={selected.size === 0 || exporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 24px',
          borderRadius: 8,
          border: 'none',
          background: selected.size > 0 && !exporting ? 'var(--acc-brand)' : 'var(--acc-text-muted)',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: selected.size > 0 && !exporting ? 'pointer' : 'default',
          transition: 'background 0.15s',
        }}
      >
        <Download size={16} />
        {exporting ? 'Exporting...' : allDone && selected.size > 0 ? 'Export Complete' : `Export ${selected.size} section${selected.size !== 1 ? 's' : ''}`}
      </button>

      <p style={{ fontSize: 12, color: 'var(--acc-text-muted)', marginTop: 16 }}>
        Exported files are downloaded directly to your device. No data is shared externally.
      </p>
    </SettingsLayout>
  );
}
