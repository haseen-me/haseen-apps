import { useEffect } from 'react';
import { DriveLayout } from '@/layout/DriveLayout';
import { DriveHeader } from '@/components/DriveHeader';
import { DriveContent } from '@/components/DriveContent';
import { UploadDialog } from '@/components/UploadDialog';
import { NewFolderDialog } from '@/components/NewFolderDialog';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useDriveStore } from '@/store/drive';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { driveApi } from '@/api/client';
import { MOCK_FILES, MOCK_FOLDERS } from '@/data/mock';
import { Toast } from '@haseen-me/ui';

export default function App() {
  const { currentFolderId, setFolders, setFiles, setPath, setLoading } = useDriveStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Initialize encryption keys
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Load files — try API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    driveApi
      .listFiles(currentFolderId === 'root' ? undefined : currentFolderId)
      .then((data) => {
        if (!cancelled) {
          setFiles(
            data.files.map((f) => ({
              id: f.id,
              folderId: f.folderID,
              name: f.name,
              mimeType: f.mimeType,
              size: f.size,
              createdAt: f.createdAt,
              updatedAt: f.updatedAt,
            })),
          );
          setFolders([]);
          setPath([]);
        }
      })
      .catch(() => {
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
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentFolderId, setFolders, setFiles, setPath, setLoading]);

  return (
    <DriveLayout>
      <DriveHeader />
      <DriveContent />
      <UploadDialog />
      <NewFolderDialog />
      <SearchOverlay />
      <Toast message={toast.message} visible={toast.visible} onDismiss={toast.hide} />
    </DriveLayout>
  );
}
