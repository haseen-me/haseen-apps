import { useState } from 'react';
import { X } from 'lucide-react';
import { calendarApi } from '@/api/client';
import { useCalendarStore } from '@/store/calendar';

const DEFAULT_COLOR = '#4285f4';
const PRESET_COLORS = [
  DEFAULT_COLOR, '#7b61ff', '#e67c73', '#f4511e',
  '#33b679', '#0b8043', '#f6bf26', '#039be5',
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddCalendarDialog({ open, onClose }: Props) {
  const { calendars, setCalendars } = useCalendarStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState<string>(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await calendarApi.createCalendar({ name: name.trim(), color }) as { id: string; name: string; color: string; createdAt: string };
      setCalendars([...calendars, {
        id: created.id,
        name: created.name,
        color: created.color,
        isDefault: false,
        createdAt: created.createdAt,
      }]);
      setName('');
      setColor(DEFAULT_COLOR);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create calendar');
    } finally {
      setSaving(false);
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
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--cal-bg-card, var(--cal-bg))',
          border: '1px solid var(--cal-border)',
          borderRadius: 'var(--cal-radius)',
          padding: 24,
          width: 360,
          maxWidth: '90vw',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>New Calendar</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cal-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ fontSize: 13, color: '#dc3545', marginBottom: 12, padding: '8px 12px', background: 'rgba(220,53,69,0.08)', borderRadius: 6 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--cal-text-secondary)' }}>
            Calendar name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Work, Personal, Travel"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--cal-border)',
              borderRadius: 'var(--cal-radius-sm)',
              background: 'var(--cal-bg)',
              color: 'var(--cal-text)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--cal-text-secondary)' }}>
            Color
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: c,
                  border: color === c ? '3px solid var(--cal-text)' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--cal-border)',
              borderRadius: 'var(--cal-radius-sm)',
              color: 'var(--cal-text)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            style={{
              padding: '8px 16px',
              background: 'var(--cal-brand)',
              border: 'none',
              borderRadius: 'var(--cal-radius-sm)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: name.trim() && !saving ? 'pointer' : 'default',
              opacity: !name.trim() || saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
