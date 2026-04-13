import { create } from 'zustand';
import type { ContactPayload, DecryptedContact, ToastState } from '@/types/contacts';
import { sortContacts } from '@/lib/contacts';

interface ContactsState {
  contacts: DecryptedContact[];
  loading: boolean;
  vaultKey: Uint8Array | null;
  searchQuery: string;
  selectedContactId: string | null;
  editorOpen: boolean;
  editingContactId: string | null;
  toast: ToastState;
  setContacts: (contacts: DecryptedContact[]) => void;
  upsertContact: (contact: DecryptedContact) => void;
  removeContact: (contactId: string) => void;
  setLoading: (loading: boolean) => void;
  setVaultKey: (vaultKey: Uint8Array) => void;
  setSearchQuery: (searchQuery: string) => void;
  selectContact: (contactId: string | null) => void;
  openEditor: (contactId?: string | null) => void;
  closeEditor: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
  getSelectedContact: () => DecryptedContact | null;
  getEditingPayload: () => ContactPayload | null;
}

const hiddenToast: ToastState = {
  message: '',
  visible: false,
};

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  loading: false,
  vaultKey: null,
  searchQuery: '',
  selectedContactId: null,
  editorOpen: false,
  editingContactId: null,
  toast: hiddenToast,
  setContacts: (contacts) =>
    set((state) => {
      const sorted = sortContacts(contacts);
      const selectedContactId =
        state.selectedContactId && sorted.some((contact) => contact.id === state.selectedContactId)
          ? state.selectedContactId
          : sorted[0]?.id ?? null;
      return { contacts: sorted, selectedContactId };
    }),
  upsertContact: (contact) =>
    set((state) => {
      const next = state.contacts.some((candidate) => candidate.id === contact.id)
        ? state.contacts.map((candidate) => (candidate.id === contact.id ? contact : candidate))
        : [...state.contacts, contact];
      return {
        contacts: sortContacts(next),
        selectedContactId: contact.id,
      };
    }),
  removeContact: (contactId) =>
    set((state) => {
      const contacts = state.contacts.filter((contact) => contact.id !== contactId);
      const selectedContactId =
        state.selectedContactId === contactId ? contacts[0]?.id ?? null : state.selectedContactId;
      return { contacts, selectedContactId };
    }),
  setLoading: (loading) => set({ loading }),
  setVaultKey: (vaultKey) => set({ vaultKey }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectContact: (selectedContactId) => set({ selectedContactId }),
  openEditor: (editingContactId = null) => set({ editorOpen: true, editingContactId }),
  closeEditor: () => set({ editorOpen: false, editingContactId: null }),
  showToast: (message) => set({ toast: { message, visible: true } }),
  hideToast: () => set({ toast: hiddenToast }),
  getSelectedContact: () => get().contacts.find((contact) => contact.id === get().selectedContactId) ?? null,
  getEditingPayload: () =>
    get().contacts.find((contact) => contact.id === get().editingContactId)?.payload ?? null,
}));
