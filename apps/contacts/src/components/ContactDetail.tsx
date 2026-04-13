import { Mail, Pencil, Trash2, StickyNote, Phone, Building, MapPin, Cake } from 'lucide-react';
import { useContactsStore } from '@/store/contacts';
import { useToastStore } from '@haseen-me/shared/toast';
import { contactsApi } from '@/api/client';

export function ContactDetail() {
  const { selectedContactId, contacts, setContacts, setSelectedContactId, setEditingContact, setDialogOpen } = useContactsStore();
  const toast = useToastStore();
  const contact = contacts.find((c) => c.id === selectedContactId);

  if (!contact) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--hsn-text-tertiary)', gap: 8 }}>
        <Mail size={40} style={{ opacity: 0.3 }} />
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--hsn-text-secondary)' }}>Select a contact</div>
        <div style={{ fontSize: 13 }}>Choose a contact from the list to view details</div>
      </div>
    );
  }

  const initial = contact.name
    ? contact.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : contact.email[0]?.toUpperCase() ?? '?';

  const handleEdit = () => {
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await contactsApi.deleteContact(contact.id);
      setContacts(contacts.filter((c) => c.id !== contact.id));
      setSelectedContactId(null);
      toast.show('Contact deleted');
    } catch {
      toast.show('Failed to delete contact');
    }
  };

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'rgba(45,184,175,0.08)', color: 'var(--hsn-accent-teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 24, flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              {contact.name || contact.email}
            </h2>
            {contact.name && (
              <div style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', marginTop: 2 }}>
                {contact.email}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={handleEdit}
              title="Edit"
              style={{
                padding: 8, borderRadius: '6px',
                border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)',
                color: 'var(--hsn-text-secondary)', display: 'flex', cursor: 'pointer',
              }}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              style={{
                padding: 8, borderRadius: '6px',
                border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)',
                color: 'var(--hsn-accent-red)', display: 'flex', cursor: 'pointer',
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Details cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Mail size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Email</h3>
            </div>
            <a href={`mailto:${contact.email}`} style={{ fontSize: 14, color: 'var(--hsn-accent-teal)' }}>
              {contact.email}
            </a>
          </div>

          {contact.phone && (
            <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Phone size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Phone</h3>
              </div>
              <a href={`tel:${contact.phone}`} style={{ fontSize: 14, color: 'var(--hsn-accent-teal)' }}>
                {contact.phone}
              </a>
            </div>
          )}

          {contact.company && (
            <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Building size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Company</h3>
              </div>
              <span style={{ fontSize: 14, color: 'var(--hsn-text-primary)' }}>{contact.company}</span>
            </div>
          )}

          {contact.address && (
            <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <MapPin size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Address</h3>
              </div>
              <span style={{ fontSize: 14, color: 'var(--hsn-text-primary)' }}>{contact.address}</span>
            </div>
          )}

          {contact.birthday && (
            <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Cake size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Birthday</h3>
              </div>
              <span style={{ fontSize: 14, color: 'var(--hsn-text-primary)' }}>{new Date(contact.birthday).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}

          {contact.notes && (
            <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <StickyNote size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)' }}>Notes</h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--hsn-text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {contact.notes}
              </p>
            </div>
          )}

          <div style={{ padding: 20, borderRadius: '8px', border: '1px solid var(--hsn-border-primary)', background: 'var(--hsn-bg-app)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--hsn-text-secondary)', marginBottom: 8 }}>Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--hsn-text-tertiary)' }}>Added</span>
                <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--hsn-text-tertiary)' }}>Updated</span>
                <span>{new Date(contact.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
