import { useEffect } from 'react';
import { DriveLayout } from '@/layout/DriveLayout';
import { DriveHeader } from '@/components/DriveHeader';
import { DriveContent } from '@/components/DriveContent';
import { UploadDialog } from '@/components/UploadDialog';
import { NewFolderDialog } from '@/components/NewFolderDialog';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useDriveStore } from '@/store/drive';
import { MOCK_FILES, MOCK_FOLDERS } from '@/data/mock';

export default function App() {
  const { currentFolderId, setFolders, setFiles, setPath } = useDriveStore();

  // Load mock data based on current folder
  useEffect(() => {
    const folders = MOCK_FOLDERS.filter((f) => {
      if (currentFolderId === 'root') return f.parentId === null;
      return f.parentId === currentFolderId;
    });
    const files = MOCK_FILES.filter((f) => {
      if (currentFolderId === 'root') return f.folderId === null;
      return f.folderId === currentFolderId;
    });

    // Build breadcrumb path
    const path: typeof MOCK_FOLDERS = [];
    let folderId: string | null = currentFolderId === 'root' ? null : currentFolderId;
    while (folderId) {
      const folder = MOCK_FOLDERS.find((f) => f.id === folderId);
      if (folder) {
        path.unshift(folder);
        folderId = folder.parentId;
      } else {
        break;
      }
    }

    setFolders(folders);
    setFiles(files);
    setPath(path);
  }, [currentFolderId, setFolders, setFiles, setPath]);

  return (
    <DriveLayout>
      <DriveHeader />
      <DriveContent />
      <UploadDialog />
      <NewFolderDialog />
      <SearchOverlay />
    </DriveLayout>
  );
}
