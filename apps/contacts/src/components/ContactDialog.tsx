import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useContactsStore } from '@/store/contacts';
import { useToastStore } from '@haseen-me/shared/toast';
import { contactsApi } from '@/api/client';

export function ContactDialog() {
  const { dialogOpen, setDialogOpen, editingContact, setEditingContact, contacts, setContacts } = useContactsStore();
  const toast = useToastStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [birthday, setBirthday] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingContact) {
      setName(editingContact.name);
      setEmail(editingContact.email);
      setNotes(editingContact.notes);
      setPhone(editingContact.phone || '');
      setCompany(editingContact.company || '');
      setAddress(editingContact.address || '');
      setBirthday(editingContact.birthday || '');
    } else {
      setName('');
      setEmail('');
      setNotes('');
      setPhone('');
      setCompany('');
      setAddress('');
      setBirthday('');
    }
  }, [editingContact, dialogOpen]);

  if (!dialogOpen) return null;

  const handleClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  const handleSave = async () => {
    if (!email.trim()) return;
    setSaving(true);
    try {
      if (editingContact) {
        const updated = await contactsApi.updateContact(editingContact.id, { name: name.trim(), email: email.trim(), notes: notes.trim(), phone: phone.trim(), company: company.trim(), address: address.trim(), birthday: birthday.trim() });
        setContacts(contacts.map((c) => (c.id === editingContact.id ? updated : c)));
        toast.show('Contact updated');
      } else {
        const created = await contactsApi.createContact({ name: name.trim(), email: email.trim(), notes: notes.trim(), phone: phone.trim(), company: company.trim(), address: address.trim(), birthday: birthday.trim() });
        setContacts([...contacts, created]);
        toast.show('Contact created');
      }
      handleClose();
    } catch {
      toast.show('Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid var(--ct-border)',
    borderRadius: 'var(--ct-radius-sm)',
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    background: 'var(--ct-bg)',
    color: 'var(--ct-text)',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--ct-bg)', borderRadius: 'var(--ct-radius)',
          boxShadow: 'var(--ct-shadow-lg)', width: 400, padding: 0, animation: 'fadeIn 0.15s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--ct-border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
            {editingContact ? 'Edit Contact' : 'New Contact'}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', padding: 4, color: 'var(--ct-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-1234" type="tel" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Birthday</label>
            <input value={birthday} onChange={(e) => setBirthday(e.target.value)} type="date" style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--ct-text-secondary)', marginBottom: 4, display: 'block' }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px', borderTop: '1px solid var(--ct-border)', gap: 8 }}>
          <button onClick={handleClose} style={{ padding: '7px 16px', border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-sm)', background: 'var(--ct-bg)', fontSize: 13, color: 'var(--ct-text)' }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!email.trim() || saving}
            style={{
              padding: '7px 16px', border: 'none', borderRadius: 'var(--ct-radius-sm)',
              background: email.trim() && !saving ? 'var(--ct-brand)' : 'var(--ct-border)',
              color: email.trim() && !saving ? '#fff' : 'var(--ct-text-muted)', fontSize: 13, fontWeight: 500,
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
