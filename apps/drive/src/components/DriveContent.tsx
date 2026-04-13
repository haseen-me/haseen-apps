import { useDriveStore } from '@/store/drive';
import { FolderCard } from './FolderCard';
import { FileCard, FileRow } from './FileCard';
import { BulkActionBar } from './BulkActionBar';
import { FolderIcon } from 'lucide-react';
import type { DriveFile, Folder, SortField, SortDir } from '@/types/drive';

function sortFiles(items: DriveFile[], field: SortField, dir: SortDir): DriveFile[] {
  const copy = [...items];
  copy.sort((a, b) => {
    let cmp = 0;
    if (field === 'name') cmp = a.name.localeCompare(b.name);
    else if (field === 'size') cmp = a.size - b.size;
    else if (field === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
    return dir === 'asc' ? cmp : -cmp;
  });
  return copy;
}

function sortFolders(items: Folder[], dir: SortDir): Folder[] {
  const copy = [...items];
  copy.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return dir === 'asc' ? cmp : -cmp;
  });
  return copy;
}

export function DriveContent() {
  const { folders, files, loading, viewMode, sortField, sortDir, currentFolderId } = useDriveStore();

  const sortedFolders = sortFolders(folders, sortDir);
  const sortedFiles = sortFiles(files, sortField, sortDir);
  const isTrash = currentFolderId === '__trash';

  if (loading) {
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {/* Folder skeletons */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 60, height: 12, borderRadius: 4, background: 'var(--hsn-bg-cell)', marginBottom: 12, animation: 'driveSkelPulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`f${i}`} style={{ height: 56, borderRadius: '8px', background: 'var(--hsn-bg-cell)', animation: 'driveSkelPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
        {/* File skeletons */}
        <div>
          <div style={{ width: 40, height: 12, borderRadius: 4, background: 'var(--hsn-bg-cell)', marginBottom: 12, animation: 'driveSkelPulse 1.5s ease-in-out infinite' }} />
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(180px, 1fr))' : '1fr', gap: 10 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`fi${i}`} style={{ height: viewMode === 'grid' ? 140 : 44, borderRadius: '8px', background: 'var(--hsn-bg-cell)', animation: 'driveSkelPulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        </div>
        <style>{`@keyframes driveSkelPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
      <BulkActionBar />
      {/* Folders */}
      {sortedFolders.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--hsn-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 10,
          }}>
            Folders
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(220px, 1fr))' : '1fr',
              gap: viewMode === 'grid' ? 10 : 2,
            }}
          >
            {sortedFolders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {sortedFiles.length > 0 && (
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--hsn-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: 10,
          }}>
            Files
          </div>
          {viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 10,
              }}
            >
              {sortedFiles.map((file) => (
                <FileCard key={file.id} file={file} isTrash={isTrash} />
              ))}
            </div>
          ) : (
            <div
              style={{
                borderRadius: '8px',
                border: '1px solid var(--hsn-border-primary)',
                overflow: 'hidden',
              }}
            >
              {/* List header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 16px',
                  background: 'var(--hsn-bg-l0-solid)',
                  borderBottom: '1px solid var(--hsn-border-primary)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--hsn-text-tertiary)',
                }}
              >
                <span style={{ width: 40 }} />
                <span style={{ flex: 1 }}>Name</span>
                <span style={{ width: 120, textAlign: 'right' }}>Modified</span>
                <span style={{ width: 80, textAlign: 'right' }}>Size</span>
                <span style={{ width: 28 }} />
              </div>
              {sortedFiles.map((file) => (
                <FileRow key={file.id} file={file} isTrash={isTrash} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const { setUploadOpen } = useDriveStore();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'rgba(45,184,175,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--hsn-cta-primary-default)',
        }}
      >
        <FolderIcon size={32} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No files yet</div>
        <div style={{ fontSize: 14, color: 'var(--hsn-text-tertiary)' }}>
          Upload files or create a folder to get started
        </div>
      </div>
      <button
        onClick={() => setUploadOpen(true)}
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          background: 'var(--hsn-cta-primary-default)',
          color: '#fff',
          border: 'none',
          fontWeight: 600,
          fontSize: 14,
          marginTop: 8,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-cta-primary-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--hsn-cta-primary-default)')}
      >
        Upload files
      </button>
    </div>
  );
}
