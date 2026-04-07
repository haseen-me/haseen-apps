import { useState, useEffect } from 'react';
import { X, Clock, MapPin, AlignLeft, Repeat, Palette, Users, Bell } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { calendarApi } from '@/api/client';
import { encryptSymmetric, decryptSymmetric } from '@haseen-me/crypto';

function toLocalDatetimeStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventDialog() {
  const { eventDialogOpen, editingEvent, selectedDate, selectedEndDate, closeEventDialog, calendars, events, setEvents } =
    useCalendarStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [recurrence, setRecurrence] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [color, setColor] = useState('#4285f4');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [existingAttendeeIds, setExistingAttendeeIds] = useState<Map<string, string>>(new Map());
  const [attendeeStatuses, setAttendeeStatuses] = useState<Map<string, string>>(new Map());
  const [reminder, setReminder] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(decryptField(editingEvent.title));
      setDescription(decryptField(editingEvent.description));
      setStart(toLocalDatetimeStr(new Date(editingEvent.startTime)));
      setEnd(toLocalDatetimeStr(new Date(editingEvent.endTime)));
      setLocation(decryptField(editingEvent.location));
      setAllDay(editingEvent.allDay);
      setRecurrence(editingEvent.recurrenceRule ?? '');
      setCalendarId(editingEvent.calendarId);
      setColor(editingEvent.color || '#4285f4');
      setAttendees([]);
      setExistingAttendeeIds(new Map());
      setAttendeeStatuses(new Map());
      setReminder('');
      // Load attendees and reminders from API
      calendarApi.listAttendees(editingEvent.id).then((res) => {
        const emails = res.attendees.map((a) => a.email);
        setAttendees(emails);
        setExistingAttendeeIds(new Map(res.attendees.map((a) => [a.email, a.id])));
        setAttendeeStatuses(new Map(res.attendees.map((a) => [a.email, a.status || 'pending'])));
      }).catch(() => {});
      calendarApi.listReminders(editingEvent.id).then((res) => {
        if (res.reminders.length > 0) setReminder(String(res.reminders[0]!.minutesBefore));
      }).catch(() => {});
    } else if (selectedDate) {
      setTitle('');
      setDescription('');
      const s = new Date(selectedDate);
      if (s.getHours() === 0 && !selectedEndDate) s.setHours(9, 0, 0, 0);
      const e = selectedEndDate ? new Date(selectedEndDate) : new Date(s);
      if (!selectedEndDate) e.setHours(s.getHours() + 1);
      setStart(toLocalDatetimeStr(s));
      setEnd(toLocalDatetimeStr(e));
      setLocation('');
      setAllDay(false);
      setRecurrence('');
      setCalendarId(calendars[0]?.id ?? '');
      setColor('#4285f4');
      setAttendees([]);
      setAttendeeInput('');
      setExistingAttendeeIds(new Map());
      setAttendeeStatuses(new Map());
      setReminder('');
    }
  }, [editingEvent, selectedDate, selectedEndDate, calendars]);

  if (!eventDialogOpen) return null;

  const toast = useToastStore();
  const encryptionKeyPair = useCryptoStore((s) => s.encryptionKeyPair);

  function fromHex(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  // Decrypt an `enc:nonce:ciphertext` field back to plaintext
  function decryptField(value: string): string {
    if (!value || !value.startsWith('enc:') || !encryptionKeyPair) return value;
    try {
      const parts = value.split(':');
      if (parts.length !== 3) return value;
      const key = encryptionKeyPair.secretKey.slice(0, 32);
      const nonce = fromHex(parts[1]!);
      const ciphertext = fromHex(parts[2]!);
      const plaintext = decryptSymmetric({ ciphertext, nonce }, key);
      return new TextDecoder().decode(plaintext);
    } catch {
      return value;
    }
  }

  // Encrypt a string with user's key for calendar storage
  function encryptField(value: string): string {
    if (!value || !encryptionKeyPair) return value;
    const key = encryptionKeyPair.secretKey.slice(0, 32);
    const plaintext = new TextEncoder().encode(value);
    const encrypted = encryptSymmetric(plaintext, key);
    const nonce = Array.from(encrypted.nonce).map((b) => b.toString(16).padStart(2, '0')).join('');
    const ct = Array.from(encrypted.ciphertext).map((b) => b.toString(16).padStart(2, '0')).join('');
    return `enc:${nonce}:${ct}`;
  }

  const handleSave = async () => {
    try {
      const encTitle = encryptField(title);
      const encDesc = encryptField(description);
      const encLoc = encryptField(location);

      if (editingEvent) {
        await calendarApi.updateEvent(editingEvent.id, {
          title: encTitle,
          description: encDesc,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
          location: encLoc,
          allDay,
          recurrenceRule: recurrence || null,
        });
        toast.show('Event updated');
        // Sync attendees for existing event
        const currentEmails = new Set(attendees);
        // Remove attendees that were deleted
        for (const [email, id] of existingAttendeeIds) {
          if (!currentEmails.has(email)) {
            await calendarApi.removeAttendee(editingEvent.id, id).catch(() => {});
          }
        }
        // Add new attendees
        for (const email of attendees) {
          if (!existingAttendeeIds.has(email)) {
            await calendarApi.addAttendee(editingEvent.id, email).catch(() => {});
          }
        }
        // Set reminder
        if (reminder) {
          await calendarApi.setReminder(editingEvent.id, Number(reminder)).catch(() => {});
        }
      } else {
        const created = await calendarApi.createEvent({
          calendarId,
          title: encTitle,
          description: encDesc,
          startTime: new Date(start).toISOString(),
          endTime: new Date(end).toISOString(),
          location: encLoc,
          allDay,
          color,
          recurrenceRule: recurrence || null,
        });
        toast.show('Event created');
        // Add attendees for new event
        for (const email of attendees) {
          await calendarApi.addAttendee(created.id, email).catch(() => {});
        }
        // Set reminder for new event
        if (reminder) {
          await calendarApi.setReminder(created.id, Number(reminder)).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('[Calendar] Save failed:', err);
      toast.show('Could not save event — backend unavailable');
      closeEventDialog();
      return;
    }
    // Refresh events in store after successful save
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString();
      const evData = await calendarApi.listEvents({ start, end });
      setEvents(
        evData.events.map((e) => ({
          id: e.id,
          calendarId: e.calendarId ?? '',
          title: decryptField(e.title),
          description: decryptField(e.description),
          startTime: e.startTime,
          endTime: e.endTime,
          allDay: e.allDay,
          location: decryptField(e.location ?? ''),
          recurrenceRule: e.recurrenceRule ?? null,
          color: e.color,
          createdAt: e.createdAt ?? '',
          updatedAt: e.updatedAt ?? '',
        })),
      );
    } catch {
      // silently skip refresh
    }
    closeEventDialog();
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    try {
      await calendarApi.deleteEvent(editingEvent.id);
      setEvents(events.filter((e) => e.id !== editingEvent.id));
      toast.show('Event deleted');
    } catch {
      toast.show('Could not delete event');
    }
    closeEventDialog();
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: 'var(--cal-text-secondary)',
    marginBottom: 4,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--cal-border)',
    borderRadius: 'var(--cal-radius-sm)',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'var(--cal-bg)',
    color: 'var(--cal-text)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={closeEventDialog}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--cal-bg)',
          borderRadius: 'var(--cal-radius)',
          boxShadow: 'var(--cal-shadow-lg)',
          width: 420,
          maxHeight: '80vh',
          overflow: 'auto',
          animation: 'fadeIn 0.15s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--cal-border)',
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h3>
          <button
            onClick={closeEventDialog}
            style={{
              background: 'none',
              border: 'none',
              padding: 4,
              color: 'var(--cal-text-muted)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            style={{ ...inputStyle, fontSize: 16, fontWeight: 500, border: 'none', padding: '4px 0' }}
          />

          {/* Calendar selector */}
          <div>
            <label style={labelStyle}>Calendar</label>
            <select
              value={calendarId}
              onChange={(e) => setCalendarId(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div>
            <label style={labelStyle}>
              <Clock size={14} /> Time
            </label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <span style={{ color: 'var(--cal-text-muted)', fontSize: 13 }}>to</span>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginTop: 8,
                fontSize: 12,
                color: 'var(--cal-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              All day
            </label>
          </div>

          {/* Recurrence */}
          <div>
            <label style={labelStyle}>
              <Repeat size={14} /> Repeat
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">Does not repeat</option>
              <option value="FREQ=DAILY">Daily</option>
              <option value="FREQ=WEEKLY">Weekly</option>
              <option value="FREQ=MONTHLY">Monthly</option>
              <option value="FREQ=YEARLY">Yearly</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>
              <MapPin size={14} /> Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Color */}
          <div>
            <label style={labelStyle}>
              <Palette size={14} /> Color
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['#4285f4','#ea4335','#fbbc04','#34a853','#ff6d01','#46bdc6','#7b1fa2','#795548','#616161'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: c,
                    border: color === c ? '2px solid var(--cal-text)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                    outline: color === c ? '2px solid var(--cal-bg)' : 'none',
                    outlineOffset: -3,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label style={labelStyle}>
              <Users size={14} /> Attendees
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && attendeeInput.trim()) {
                    e.preventDefault();
                    const email = attendeeInput.trim().toLowerCase();
                    if (!attendees.includes(email)) setAttendees([...attendees, email]);
                    setAttendeeInput('');
                  }
                }}
                placeholder="Add email and press Enter"
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>
            {attendees.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                {attendees.map((email) => {
                  const status = attendeeStatuses.get(email) || 'pending';
                  const statusColor = status === 'accepted' ? '#30a46c' : status === 'declined' ? '#e5484d' : status === 'tentative' ? '#f5a623' : 'var(--cal-text-muted)';
                  const statusLabel = status === 'accepted' ? '✓' : status === 'declined' ? '✗' : status === 'tentative' ? '?' : '·';
                  const attendeeId = existingAttendeeIds.get(email);
                  return (
                    <span
                      key={email}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: 'var(--cal-bg-muted, #f1f3f4)',
                        fontSize: 12,
                        color: 'var(--cal-text-secondary)',
                      }}
                    >
                      <span style={{ color: statusColor, fontWeight: 700, fontSize: 11, width: 12, textAlign: 'center' }} title={status}>
                        {statusLabel}
                      </span>
                      {email}
                      {attendeeId && (
                        <select
                          value={status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as 'accepted' | 'declined' | 'tentative';
                            try {
                              await calendarApi.updateAttendeeStatus(editingEvent!.id, attendeeId, newStatus);
                              setAttendeeStatuses(new Map(attendeeStatuses).set(email, newStatus));
                            } catch { /* ignore */ }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 10,
                            color: statusColor,
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="declined">Declined</option>
                          <option value="tentative">Maybe</option>
                        </select>
                      )}
                      <button
                        onClick={() => setAttendees(attendees.filter((a) => a !== email))}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'inherit', lineHeight: 1 }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label style={labelStyle}>
              <Bell size={14} /> Reminder
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">No reminder</option>
              <option value="5">5 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: editingEvent ? 'space-between' : 'flex-end',
            padding: '12px 16px',
            borderTop: '1px solid var(--cal-border)',
            gap: 8,
          }}
        >
          {editingEvent && (
            <button
              onClick={handleDelete}
              style={{
                padding: '7px 16px',
                border: 'none',
                borderRadius: 'var(--cal-radius-sm)',
                background: 'var(--cal-danger)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Delete
            </button>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={closeEventDialog}
              style={{
                padding: '7px 16px',
                border: '1px solid var(--cal-border)',
                borderRadius: 'var(--cal-radius-sm)',
                background: 'var(--cal-bg)',
                fontSize: 13,
                color: 'var(--cal-text)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '7px 16px',
                border: 'none',
                borderRadius: 'var(--cal-radius-sm)',
                background: 'var(--cal-brand)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
