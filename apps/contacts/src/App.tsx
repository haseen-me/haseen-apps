import { useEffect } from 'react';
import { Search, Plus, Users } from 'lucide-react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { ProductRail } from '@/components/ProductRail';
import { ContactList } from '@/components/ContactList';
import { ContactDetail } from '@/components/ContactDetail';
import { ContactDialog } from '@/components/ContactDialog';
import { useContactsStore } from '@/store/contacts';
import { useToastStore } from '@/store/toast';
import { contactsApi } from '@/api/client';

function ContactsApp() {
  const { setContacts, setLoading, searchQuery, setSearchQuery, setDialogOpen, setEditingContact } = useContactsStore();
  const toast = useToastStore();

  useEffect(() => {
    setLoading(true);
    contactsApi.listContacts()
      .then((res) => setContacts(res.contacts))
      .catch(() => {
        // Graceful fallback — show empty state
      })
      .finally(() => setLoading(false));
  }, [setContacts, setLoading]);

  const handleNew = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <ProductRail activeProduct="contacts" />

      {/* Sidebar */}
      <div
        style={{
          width: 320, borderRight: '1px solid var(--ct-border)',
          display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden',
          background: 'var(--ct-bg)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ct-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} style={{ color: 'var(--ct-brand)' }} />
              <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Contacts</h1>
            </div>
            <button
              onClick={handleNew}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '6px 12px', borderRadius: 'var(--ct-radius-sm)',
                border: 'none', background: 'var(--ct-brand)', color: '#fff',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus size={14} /> New
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ct-text-muted)' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              style={{
                width: '100%', padding: '7px 10px 7px 30px',
                border: '1px solid var(--ct-border)', borderRadius: 'var(--ct-radius-sm)',
                fontSize: 13, fontFamily: 'inherit', outline: 'none',
                background: 'var(--ct-bg-secondary)', color: 'var(--ct-text)',
              }}
            />
          </div>
        </div>

        <ContactList />
      </div>

      {/* Detail panel */}
      <ContactDetail />

      {/* Dialog */}
      <ContactDialog />

      {/* Toast */}
      {toast.visible && (
        <div
          style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--ct-text)', color: 'var(--ct-bg)', padding: '10px 20px',
            borderRadius: 'var(--ct-radius)', fontSize: 13, fontWeight: 500,
            boxShadow: 'var(--ct-shadow-lg)', zIndex: 200, animation: 'fadeIn 0.15s ease',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ContactsApp />
    </ErrorBoundary>
  );
}
