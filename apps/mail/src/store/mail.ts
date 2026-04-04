import { create } from 'zustand';
import type { Thread, SystemLabel, UserLabel } from '@/types/mail';

interface MailboxState {
  /* Current view */
  activeLabel: string;
  setActiveLabel: (label: string) => void;

  /* Threads */
  threads: Thread[];
  setThreads: (threads: Thread[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;

  /* Selected thread */
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;

  /* Selected message IDs (for bulk actions) */
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  /* User labels */
  userLabels: UserLabel[];
  setUserLabels: (labels: UserLabel[]) => void;

  /* Compose */
  composeOpen: boolean;
  setComposeOpen: (v: boolean) => void;
  replyToThreadId: string | null;
  setReplyToThreadId: (id: string | null) => void;
  forwardFromThreadId: string | null;
  setForwardFromThreadId: (id: string | null) => void;

  /* Search */
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  /* Sidebar */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useMailStore = create<MailboxState>((set, get) => ({
  activeLabel: 'inbox',
  setActiveLabel: (label) => set({ activeLabel: label, activeThreadId: null, selectedIds: new Set() }),

  threads: [],
  setThreads: (threads) => set({ threads }),
  loading: false,
  setLoading: (loading) => set({ loading }),

  activeThreadId: null,
  setActiveThreadId: (id) => set({ activeThreadId: id }),

  selectedIds: new Set(),
  toggleSelected: (id) => {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedIds: next });
  },
  selectAll: () => set({ selectedIds: new Set(get().threads.map((t) => t.id)) }),
  clearSelection: () => set({ selectedIds: new Set() }),

  userLabels: [],
  setUserLabels: (labels) => set({ userLabels: labels }),

  composeOpen: false,
  setComposeOpen: (v) => set({ composeOpen: v }),
  replyToThreadId: null,
  setReplyToThreadId: (id) => set({ replyToThreadId: id }),
  forwardFromThreadId: null,
  setForwardFromThreadId: (id) => set({ forwardFromThreadId: id }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
