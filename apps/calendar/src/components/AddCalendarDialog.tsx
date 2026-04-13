import { useState } from 'react';
import { Dialog, InputField, Input, InputType, Banner, Button, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
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

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await calendarApi.createCalendar({ name: name.trim(), color }) as { id: string; name: string; color: string; createdAt: string };
      setCalendars([...calendars, { id: created.id, name: created.name, color: created.color, isDefault: false, createdAt: created.createdAt }]);
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
    <Dialog
      open={open}
      onClose={onClose}
      title="New Calendar"
      actions={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={onClose}>Cancel</Button>
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handleSave} disabled={!name.trim() || saving} loading={saving}>
            Create
          </Button>
        </div>
      }
    >
      {error && <Banner color="error" style={{ marginBottom: 12, borderRadius: 8 }}>{error}</Banner>}

      <InputField label="Calendar name" style={{ marginBottom: 16 }}>
        <Input
          type={InputType.TEXT}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Work, Personal, Travel"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
        />
      </InputField>

      <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', fontWeight: 500, marginBottom: 8 }}>
        Color
      </Typography>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 28, height: 28, borderRadius: '50%', background: c,
              border: color === c ? '3px solid var(--hsn-text-primary)' : '2px solid transparent',
              cursor: 'pointer', outline: 'none', padding: 0,
            }}
          />
        ))}
      </div>
    </Dialog>
  );
}
