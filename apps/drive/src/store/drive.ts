import { create } from 'zustand';
import type { DriveFile, Folder, ViewMode, SortField, SortDir } from '@/types/drive';

interface DriveState {
  // Navigation
  currentFolderId: string;
  setCurrentFolderId: (id: string) => void;
  path: Folder[];
  setPath: (p: Folder[]) => void;

  // Contents
  folders: Folder[];
  setFolders: (f: Folder[]) => void;
  files: DriveFile[];
  setFiles: (f: DriveFile[]) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;

  // Selection
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // View
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  sortField: SortField;
  sortDir: SortDir;
  setSort: (field: SortField, dir: SortDir) => void;

  // Upload
  uploadOpen: boolean;
  setUploadOpen: (v: boolean) => void;

  // Search
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // New folder
  newFolderOpen: boolean;
  setNewFolderOpen: (v: boolean) => void;

  // File preview
  previewFileId: string | null;
  setPreviewFileId: (id: string | null) => void;

  // Share dialog
  shareDialogFileId: string | null;
  setShareDialogFileId: (id: string | null) => void;
}

export const useDriveStore = create<DriveState>((set, get) => ({
  currentFolderId: 'root',
  setCurrentFolderId: (id) => set({ currentFolderId: id, selectedIds: new Set() }),
  path: [],
  setPath: (path) => set({ path }),

  folders: [],
  setFolders: (folders) => set({ folders }),
  files: [],
  setFiles: (files) => set({ files }),
  loading: false,
  setLoading: (loading) => set({ loading }),

  selectedIds: new Set(),
  toggleSelected: (id) => {
    const next = new Set(get().selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    set({ selectedIds: next });
  },
  selectAll: () => {
    const ids = [...get().folders.map(f => f.id), ...get().files.map(f => f.id)];
    set({ selectedIds: new Set(ids) });
  },
  clearSelection: () => set({ selectedIds: new Set() }),

  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),
  sortField: 'name',
  sortDir: 'asc',
  setSort: (sortField, sortDir) => set({ sortField, sortDir }),

  uploadOpen: false,
  setUploadOpen: (uploadOpen) => set({ uploadOpen }),

  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  newFolderOpen: false,
  setNewFolderOpen: (newFolderOpen) => set({ newFolderOpen }),

  previewFileId: null,
  setPreviewFileId: (previewFileId) => set({ previewFileId }),

  shareDialogFileId: null,
  setShareDialogFileId: (shareDialogFileId) => set({ shareDialogFileId }),
}));
