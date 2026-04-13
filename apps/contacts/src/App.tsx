import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Building2,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Tags,
  Trash2,
  Users,
} from 'lucide-react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { ProductRail } from '@haseen-me/shared/ProductRail';
import { requireAuth } from '@haseen-me/shared';
import {
  Banner,
  Button,
  HaseenThemeProvider,
  Input,
  InputField,
  Toast,
  Typography,
  TypographySize,
  TypographyWeight,
} from '@haseen-me/ui';
import { Size, Type } from '@haseen-me/ui';
import { contactsApi } from '@/api/client';
import { ContactEditorDialog } from '@/components/ContactEditorDialog';
import { decryptRecord, encryptPayload, getOrCreateVaultKey } from '@/lib/crypto';
import {
  getPrimaryAddress,
  getPrimaryField,
  normalizeContactPayload,
} from '@/lib/contacts';
import { useContactsStore } from '@/store/contacts';

function ContactsApp() {
  const [authed, setAuthed] = useState(false);
  const [saving, setSaving] = useState(false);
  const {
    contacts,
    loading,
    vaultKey,
    searchQuery,
    selectedContactId,
    editorOpen,
    editingContactId,
    toast,
    setContacts,
    upsertContact,
    removeContact,
    setLoading,
    setVaultKey,
    setSearchQuery,
    selectContact,
    openEditor,
    closeEditor,
    showToast,
    hideToast,
  } = useContactsStore();

  useEffect(() => {
    void requireAuth().then((ok) => {
      if (!ok) {
        return;
      }

      setAuthed(true);
      setVaultKey(getOrCreateVaultKey());
    });
  }, [setVaultKey]);

  useEffect(() => {
    if (!authed || !vaultKey) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    void contactsApi
      .listContacts()
      .then((response) => {
        if (cancelled) {
          return;
        }

        const decrypted = response.contacts.flatMap((record) => {
          try {
            return [decryptRecord(record, vaultKey)];
          } catch {
            return [];
          }
        });

        setContacts(decrypted);
        if (response.contacts.length > decrypted.length) {
          showToast('Some encrypted contacts could not be decrypted with the local vault key.');
        }
      })
      .catch(() => {
        if (!cancelled) {
          showToast('Unable to load contacts right now.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authed, setContacts, setLoading, showToast, vaultKey]);

  const filteredContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return contacts;
    }

    return contacts.filter((contact) => contact.searchIndex.includes(query));
  }, [contacts, searchQuery]);

  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? filteredContacts[0] ?? null;
  const editingPayload =
    contacts.find((contact) => contact.id === editingContactId)?.payload ?? null;

  useEffect(() => {
    if (selectedContact && selectedContact.id !== selectedContactId) {
      selectContact(selectedContact.id);
    }
  }, [selectContact, selectedContact, selectedContactId]);

  const handleSave = async (payload: Parameters<typeof normalizeContactPayload>[0]) => {
    if (!vaultKey) {
      showToast('The local encryption key is not ready yet.');
      return;
    }

    setSaving(true);
    try {
      const normalized = normalizeContactPayload(payload, editingPayload?.createdAt);
      const encryptedData = encryptPayload(normalized, vaultKey);
      const record = editingContactId
        ? await contactsApi.updateContact(editingContactId, { encryptedData })
        : await contactsApi.createContact({ encryptedData });

      upsertContact(decryptRecord(record, vaultKey));
      closeEditor();
      showToast(editingContactId ? 'Encrypted contact updated.' : 'Encrypted contact created.');
    } catch {
      showToast('Unable to save the encrypted contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) {
      return;
    }

    const confirmed = window.confirm('Delete this encrypted contact?');
    if (!confirmed) {
      return;
    }

    try {
      await contactsApi.deleteContact(selectedContact.id);
      removeContact(selectedContact.id);
      showToast('Encrypted contact deleted.');
    } catch {
      showToast('Unable to delete the contact.');
    }
  };

  if (!authed) {
    return null;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--hsn-bg-app)' }}>
      <ProductRail activeProduct="contacts" />

      <aside
        style={{
          width: 360,
          flexShrink: 0,
          borderRight: '1px solid var(--hsn-border-primary)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--hsn-bg-app)',
        }}
      >
        <div style={{ padding: 20, display: 'grid', gap: 16, borderBottom: '1px solid var(--hsn-border-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="var(--hsn-accent-teal-primary)" />
                <Typography size={TypographySize.BODY} weight={TypographyWeight.BOLD}>
                  Contacts
                </Typography>
              </div>
              <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                Google Contacts-style organization with client-side encryption by default.
              </Typography>
            </div>
            <Button type={Type.PRIMARY} size={Size.SMALL} onClick={() => openEditor(null)} startIcon={<Plus size={14} />}>
              New
            </Button>
          </div>

          <Banner color="info">
            Search runs only after local decryption. The contacts service stores opaque encrypted blobs.
          </Banner>

          <InputField label="Search decrypted contacts">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Name, email, phone, label..."
              startIcon={<Search size={16} />}
            />
          </InputField>
        </div>

        <div style={{ overflow: 'auto', padding: 12, display: 'grid', gap: 8 }}>
          {loading ? (
            <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)', padding: 8 }}>
              Decrypting contacts...
            </Typography>
          ) : null}

          {!loading && filteredContacts.length === 0 ? (
            <div style={{ padding: 16, border: '1px dashed var(--hsn-border-primary)', borderRadius: 10 }}>
              <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
                No visible contacts
              </Typography>
              <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)', marginTop: 6 }}>
                Create your first encrypted contact or refine the local search query.
              </Typography>
            </div>
          ) : null}

          {filteredContacts.map((contact) => {
            const active = contact.id === selectedContact?.id;
            const primaryEmail = getPrimaryField(contact.payload.emails);
            const primaryPhone = getPrimaryField(contact.payload.phones);

            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => selectContact(contact.id)}
                style={{
                  textAlign: 'left',
                  borderRadius: 12,
                  border: active ? '1px solid var(--hsn-border-input-focus)' : '1px solid var(--hsn-border-primary)',
                  background: active ? 'var(--hsn-bg-cell-selected)' : 'var(--hsn-bg-l1-solid)',
                  padding: 14,
                  display: 'grid',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
                  {contact.payload.name.displayName || primaryEmail || primaryPhone || 'Untitled contact'}
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                  {primaryEmail || 'No email'}
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                  {primaryPhone || 'No phone'}
                </Typography>
              </button>
            );
          })}
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: 28 }}>
        {selectedContact ? (
          <div style={{ maxWidth: 880, margin: '0 auto', display: 'grid', gap: 20 }}>
            <div
              style={{
                border: '1px solid var(--hsn-border-primary)',
                borderRadius: 16,
                padding: 24,
                background: 'var(--hsn-bg-l1-solid)',
                display: 'grid',
                gap: 18,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <Typography size={TypographySize.BODY} weight={TypographyWeight.BOLD} style={{ fontSize: '1.375rem' }}>
                    {selectedContact.payload.name.displayName || 'Untitled contact'}
                  </Typography>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--hsn-text-secondary)' }}>
                    <ShieldCheck size={16} />
                    <Typography size={TypographySize.CAPTION}>
                      Stored as encrypted payload, last updated {new Date(selectedContact.updatedAt).toLocaleString()}
                    </Typography>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => openEditor(selectedContact.id)} startIcon={<Pencil size={14} />}>
                    Edit
                  </Button>
                  <Button type={Type.DESTRUCTIVE} size={Size.SMALL} onClick={() => void handleDelete()} startIcon={<Trash2 size={14} />}>
                    Delete
                  </Button>
                </div>
              </div>

              <Banner color="success">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LockKeyhole size={16} />
                  <span>Zero-knowledge mode: the backend only stores the encrypted blob in `encrypted_data`.</span>
                </div>
              </Banner>

              <DetailSection
                icon={<Mail size={16} />}
                title="Emails"
                items={selectedContact.payload.emails.map((item) => formatLabeledValue(item.label, item.customLabel, item.value))}
                empty="No encrypted email values saved."
              />
              <DetailSection
                icon={<Phone size={16} />}
                title="Phones"
                items={selectedContact.payload.phones.map((item) => formatLabeledValue(item.label, item.customLabel, item.value))}
                empty="No encrypted phone values saved."
              />
              <DetailSection
                icon={<Building2 size={16} />}
                title="Organization"
                items={[selectedContact.payload.company, selectedContact.payload.jobTitle].filter(Boolean)}
                empty="No encrypted organization fields saved."
              />
              <DetailSection
                icon={<MapPin size={16} />}
                title="Addresses"
                items={selectedContact.payload.addresses.map((address) => formatAddress(address))}
                empty="No encrypted addresses saved."
              />
              <DetailSection
                icon={<Tags size={16} />}
                title="Labels"
                items={selectedContact.payload.labels}
                empty="No encrypted labels saved."
              />
              <DetailSection
                icon={<Users size={16} />}
                title="Relationships"
                items={selectedContact.payload.relationships.map((relationship) =>
                  formatLabeledValue(relationship.label, relationship.customLabel, relationship.name),
                )}
                empty="No encrypted relationships saved."
              />
              <DetailSection
                icon={<ShieldCheck size={16} />}
                title="Events"
                items={selectedContact.payload.events.map((event) =>
                  formatLabeledValue(event.label, event.customLabel, event.dateIso),
                )}
                empty="No encrypted events saved."
              />

              <div style={{ display: 'grid', gap: 8 }}>
                <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
                  Notes
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)', whiteSpace: 'pre-wrap' }}>
                  {selectedContact.payload.notes || 'No encrypted notes saved.'}
                </Typography>
              </div>

              <div style={{ display: 'grid', gap: 4 }}>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                  Primary email: {getPrimaryField(selectedContact.payload.emails) || 'None'}
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                  Primary phone: {getPrimaryField(selectedContact.payload.phones) || 'None'}
                </Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
                  Primary address: {getPrimaryAddress(selectedContact.payload.addresses) || 'None'}
                </Typography>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: 720, margin: '64px auto 0', display: 'grid', gap: 16 }}>
            <Typography size={TypographySize.BODY} weight={TypographyWeight.BOLD} style={{ fontSize: '1.25rem' }}>
              Encrypted contacts stay client-readable only
            </Typography>
            <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
              The contacts service only stores encrypted records with `id`, `user_id`, `encrypted_data`, and timestamps. Create a contact to start building the encrypted address book.
            </Typography>
            <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={() => openEditor(null)} startIcon={<Plus size={16} />} style={{ justifySelf: 'flex-start' }}>
              Create encrypted contact
            </Button>
          </div>
        )}
      </main>

      <ContactEditorDialog
        open={editorOpen}
        initialValue={editingPayload}
        saving={saving}
        onClose={closeEditor}
        onSave={handleSave}
      />
      <Toast message={toast.message} visible={toast.visible} onDismiss={hideToast} />
    </div>
  );
}

interface DetailSectionProps {
  icon: ReactNode;
  title: string;
  items: string[];
  empty: string;
}

function DetailSection({ icon, title, items, empty }: DetailSectionProps) {
  return (
    <section style={{ display: 'grid', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
          {title}
        </Typography>
      </div>
      {items.length ? (
        <div style={{ display: 'grid', gap: 6 }}>
          {items.map((item) => (
            <Typography key={item} size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
              {item}
            </Typography>
          ))}
        </div>
      ) : (
        <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
          {empty}
        </Typography>
      )}
    </section>
  );
}

function formatLabeledValue(label: string, customLabel: string, value: string): string {
  const resolvedLabel = label === 'custom' ? customLabel || 'Custom' : capitalize(label);
  return `${resolvedLabel}: ${value}`;
}

function formatAddress(address: Parameters<typeof getPrimaryAddress>[0][number]): string {
  const label = address.label === 'custom' ? address.customLabel || 'Custom' : capitalize(address.label);
  const lines = [
    address.streetLine1,
    address.streetLine2,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
  return `${label}: ${lines}`;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function App() {
  return (
    <HaseenThemeProvider>
      <ErrorBoundary>
        <ContactsApp />
      </ErrorBoundary>
    </HaseenThemeProvider>
  );
}
