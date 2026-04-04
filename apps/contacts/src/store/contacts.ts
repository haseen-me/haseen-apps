import { create } from 'zustand';
import type { Contact } from '@haseen-me/api-client';

interface ContactsState {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  editingContact: Contact | null;
  setEditingContact: (c: Contact | null) => void;
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectedContactId: null,
  setSelectedContactId: (selectedContactId) => set({ selectedContactId }),
  editingContact: null,
  setEditingContact: (editingContact) => set({ editingContact }),
  dialogOpen: false,
  setDialogOpen: (dialogOpen) => set({ dialogOpen }),
}));
