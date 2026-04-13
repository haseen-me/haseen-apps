import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { requireAuth } from '@haseen-me/shared';
import { DriveLayout } from '@/layout/DriveLayout';
import { DriveHeader } from '@/components/DriveHeader';
import { DriveContent } from '@/components/DriveContent';
import { UploadDialog } from '@/components/UploadDialog';
import { NewFolderDialog } from '@/components/NewFolderDialog';
import { FilePreviewPanel } from '@/components/FilePreviewPanel';
import { ShareDialog } from '@/components/ShareDialog';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useDriveStore } from '@/store/drive';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';
import { MOCK_FILES, MOCK_FOLDERS } from '@/data/mock';
import { Toast } from '@haseen-me/ui';

export default function App() {
  const [authed, setAuthed] = useState(false);
  const { currentFolderId, setFolders, setFiles, setPath, setLoading } = useDriveStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Check auth on mount
  useEffect(() => {
    void requireAuth().then((ok) => {
      if (ok) setAuthed(true);
    });
  }, []);

  // Initialize encryption keys
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Load files — try API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadData = async () => {
      try {
        if (currentFolderId === '__trash') {
          const data = await driveApi.listTrash();
          if (!cancelled) {
            setFiles(
              data.files.map((f) => ({
                id: f.id,
                folderId: f.folderID,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                encryptedKey: f.encryptedKey,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                starred: f.starred,
              })),
            );
            setFolders([]);
            setPath([]);
          }
        } else if (currentFolderId === '__shared') {
          const data = await driveApi.sharedWithMe();
          if (!cancelled) {
            setFiles(
              data.files.map((f) => ({
                id: f.id,
                folderId: f.folderID,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                encryptedKey: f.encryptedKey,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                starred: f.starred,
              })),
            );
            setFolders([]);
            setPath([]);
          }
        } else if (currentFolderId === '__starred') {
          const data = await driveApi.listStarred();
          if (!cancelled) {
            setFiles(
              data.files.map((f) => ({
                id: f.id,
                folderId: f.folderID,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                encryptedKey: f.encryptedKey,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                starred: f.starred,
              })),
            );
            setFolders([]);
            setPath([]);
          }
        } else if (currentFolderId === '__recent') {
          // Recent: fetch root folder files and sort by updatedAt descending
          const data = await driveApi.listFolder();
          if (!cancelled) {
            const recentFiles = data.files
              .map((f) => ({
                id: f.id,
                folderId: f.folderID,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                encryptedKey: f.encryptedKey,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                starred: f.starred,
              }))
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 50);
            setFiles(recentFiles);
            setFolders([]);
            setPath([]);
          }
        } else {
          const data = await driveApi.listFolder(
            currentFolderId === 'root' ? undefined : currentFolderId,
          );
          if (!cancelled) {
            setFiles(
              data.files.map((f) => ({
                id: f.id,
                folderId: f.folderID,
                name: f.name,
                mimeType: f.mimeType,
                size: f.size,
                encryptedKey: f.encryptedKey,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt,
                starred: f.starred,
              })),
            );
            setFolders(
              data.folders.map((f) => ({
                id: f.id,
                parentId: f.parentId,
                name: f.name,
                createdAt: f.createdAt,
              })),
            );
            setPath(
              data.path.map((f) => ({
                id: f.id,
                parentId: f.parentId,
                name: f.name,
                createdAt: f.createdAt,
              })),
            );
          }
        }
      } catch {
        // Backend unavailable — use mock data
        if (!cancelled) {
          const folders = MOCK_FOLDERS.filter((f) => {
            if (currentFolderId === 'root') return f.parentId === null;
            return f.parentId === currentFolderId;
          });
          const files = MOCK_FILES.filter((f) => {
            if (currentFolderId === 'root') return f.folderId === null;
            return f.folderId === currentFolderId;
          });

          const path: typeof MOCK_FOLDERS = [];
          let fid: string | null = currentFolderId === 'root' ? null : currentFolderId;
          while (fid) {
            const folder = MOCK_FOLDERS.find((f) => f.id === fid);
            if (folder) {
              path.unshift(folder);
              fid = folder.parentId;
            } else {
              break;
            }
          }

          setFolders(folders);
          setFiles(files);
          setPath(path);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentFolderId, setFolders, setFiles, setPath, setLoading]);

  // Keyboard shortcuts
  const { setSearchOpen, setUploadOpen, setNewFolderOpen, selectedIds, clearSelection, setPreviewFileId, viewMode, setViewMode, files, folders } = useDriveStore();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;

      // ⌘K or / — open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      // u — upload
      if (e.key === 'u' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setUploadOpen(true);
        return;
      }
      // n — new folder
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        setNewFolderOpen(true);
        return;
      }
      // Delete/Backspace — trash selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        (async () => {
          try {
            for (const id of selectedIds) {
              await driveApi.deleteFile(id);
            }
            toast.show(`${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''} moved to trash`);
            clearSelection();
          } catch {
            toast.show('Failed to delete');
          }
        })();
        return;
      }
      // Escape — clear selection or close preview
      if (e.key === 'Escape') {
        if (selectedIds.size > 0) clearSelection();
        else setPreviewFileId(null);
        return;
      }
      // v — toggle view mode
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
        setViewMode(viewMode === 'grid' ? 'list' : 'grid');
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen, setUploadOpen, setNewFolderOpen, selectedIds, clearSelection, setPreviewFileId, viewMode, setViewMode, files, folders, toast]);

  if (!authed) return null;

  return (
    <ErrorBoundary>
    <DriveLayout>
      <DriveHeader />
      <DriveContent />
      <UploadDialog />
      <NewFolderDialog />
      <FilePreviewPanel />
      <ShareDialog />
      <SearchOverlay />
      <Toast
        message={toast.countdown ? `${toast.message} (${toast.countdown}s)` : toast.message}
        visible={toast.visible}
        onDismiss={toast.hide}
        action={toast.action ?? undefined}
        duration={toast.countdown ? 0 : undefined}
      />
    </DriveLayout>
    </ErrorBoundary>
  );
}
