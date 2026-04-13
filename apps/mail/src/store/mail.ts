import { create } from 'zustand';
import type { Thread, SystemLabel, UserLabel } from '@/types/mail';

interface MailboxState {
  /* Current view */
  activeLabel: string;
  setActiveLabel: (label: string) => void;

  /* Threads */
  threads: Thread[];
  setThreads: (threads: Thread[]) => void;
  appendThreads: (threads: Thread[]) => void;
  upsertThread: (thread: Thread) => void;
  removeThread: (threadId: string) => void;
  patchThread: (threadId: string, updater: (thread: Thread) => Thread) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;

  /* Pagination */
  cursor: string | null;
  setCursor: (c: string | null) => void;
  hasMore: boolean;
  setHasMore: (v: boolean) => void;
  loadingMore: boolean;
  setLoadingMore: (v: boolean) => void;

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

  /* Sort preference */
  sortBy: 'date' | 'sender' | 'subject';
  setSortBy: (v: 'date' | 'sender' | 'subject') => void;

  /* Settings panel */
  settingsView: 'mail' | 'domains';
  setSettingsView: (v: 'mail' | 'domains') => void;
}

export const useMailStore = create<MailboxState>((set, get) => ({
  activeLabel: 'inbox',
  setActiveLabel: (label) => set({ activeLabel: label, activeThreadId: null, selectedIds: new Set(), threads: [], cursor: null, hasMore: false }),

  threads: [],
  setThreads: (threads) => set({ threads }),
  appendThreads: (threads) => set((s) => {
    const existingIds = new Set(s.threads.map((t) => t.id));
    const newThreads = threads.filter((t) => !existingIds.has(t.id));
    return { threads: [...s.threads, ...newThreads] };
  }),
  upsertThread: (thread) => set((s) => {
    const index = s.threads.findIndex((existing) => existing.id === thread.id);
    if (index === -1) {
      return { threads: [thread, ...s.threads] };
    }
    const next = [...s.threads];
    next[index] = thread;
    return { threads: next };
  }),
  removeThread: (threadId) => set((s) => ({
    threads: s.threads.filter((thread) => thread.id !== threadId),
    activeThreadId: s.activeThreadId === threadId ? null : s.activeThreadId,
  })),
  patchThread: (threadId, updater) => set((s) => ({
    threads: s.threads.map((thread) => (thread.id === threadId ? updater(thread) : thread)),
  })),
  loading: false,
  setLoading: (loading) => set({ loading }),

  cursor: null,
  setCursor: (cursor) => set({ cursor }),
  hasMore: false,
  setHasMore: (hasMore) => set({ hasMore }),
  loadingMore: false,
  setLoadingMore: (loadingMore) => set({ loadingMore }),

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

  sortBy: 'date',
  setSortBy: (sortBy) => set({ sortBy }),

  settingsView: 'mail',
  setSettingsView: (settingsView) => set({ settingsView }),
}));
