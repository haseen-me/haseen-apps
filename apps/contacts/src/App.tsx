import { useEffect, useRef } from 'react';
import { Search, Plus, Users, Upload, Download } from 'lucide-react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { ProductRail } from '@/components/ProductRail';
import { ContactList } from '@/components/ContactList';
import { ContactDetail } from '@/components/ContactDetail';
import { ContactDialog } from '@/components/ContactDialog';
import { useContactsStore } from '@/store/contacts';
import { useToastStore } from '@/store/toast';
import { contactsApi } from '@/api/client';
import type { Contact } from '@haseen-me/api-client';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function ContactsApp() {
  const { contacts, setContacts, setLoading, searchQuery, setSearchQuery, setDialogOpen, setEditingContact } = useContactsStore();
  const toast = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    contactsApi.listContacts()
      .then((res: { contacts: Contact[] }) => setContacts(res.contacts))
      .catch(() => {
        // Graceful fallback — show empty state
      })
      .finally(() => setLoading(false));
  }, [setContacts, setLoading]);

  const handleNew = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  const handleExport = () => {
    if (contacts.length === 0) {
      toast.show('No contacts to export');
      return;
    }
    const header = 'Name,Email,Notes';
    const rows = contacts.map((c: Contact) => {
      const name = csvEscape(c.name);
      const email = csvEscape(c.email);
      const notes = csvEscape(c.notes || '');
      return `${name},${email},${notes}`;
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.show(`Exported ${contacts.length} contacts`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      toast.show('CSV file is empty or has no data rows');
      return;
    }
    // Skip header row
    const headerLower = lines[0]!.toLowerCase();
    const startIdx = headerLower.includes('name') || headerLower.includes('email') ? 1 : 0;
    let imported = 0;
    for (let i = startIdx; i < lines.length; i++) {
      const fields = parseCsvLine(lines[i]!);
      const name = fields[0]?.trim();
      const email = fields[1]?.trim();
      if (!email) continue;
      try {
        const created = await contactsApi.createContact({ name: name || email, email, notes: fields[2]?.trim() || '' });
        setContacts([...useContactsStore.getState().contacts, created]);
        imported++;
      } catch {
        // Skip duplicate or failed entries
      }
    }
    toast.show(imported > 0 ? `Imported ${imported} contacts` : 'No new contacts imported');
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

          {/* Import / Export row */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 'var(--ct-radius-sm)',
                border: '1px solid var(--ct-border)', background: 'none',
                color: 'var(--ct-text-muted)', fontSize: 11, cursor: 'pointer',
              }}
            >
              <Upload size={12} /> Import CSV
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
            </label>
            <button
              onClick={handleExport}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', borderRadius: 'var(--ct-radius-sm)',
                border: '1px solid var(--ct-border)', background: 'none',
                color: 'var(--ct-text-muted)', fontSize: 11, cursor: 'pointer',
              }}
            >
              <Download size={12} /> Export CSV
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
