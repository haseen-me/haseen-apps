import { create } from 'zustand';
import type { Contact, ContactGroup } from '@haseen-me/api-client';

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
  groups: ContactGroup[];
  setGroups: (groups: ContactGroup[]) => void;
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  groupMembers: Map<string, Set<string>>;
  setGroupMembers: (groupId: string, contactIds: string[]) => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
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
  groups: [],
  setGroups: (groups) => set({ groups }),
  activeGroupId: null,
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
  groupMembers: new Map(),
  setGroupMembers: (groupId, contactIds) => {
    const next = new Map(get().groupMembers);
    next.set(groupId, new Set(contactIds));
    set({ groupMembers: next });
  },
}));
