import { useState } from 'react';
import { Trash2, FolderInput, Download, X } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@/store/toast';
import { driveApi } from '@/api/client';
import { decryptSymmetric } from '@haseen-me/crypto';
import { ConfirmDialog } from './ConfirmDialog';
import { MoveToDialog } from './MoveToDialog';

export function BulkActionBar() {
  const { selectedIds, clearSelection, files, setFiles, folders, setFolders } = useDriveStore();
  const toast = useToastStore();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const count = selectedIds.size;
  if (count === 0) return null;

  const selectedFiles = files.filter((f) => selectedIds.has(f.id));
  const selectedFolders = folders.filter((f) => selectedIds.has(f.id));

  const handleBulkDelete = async () => {
    setConfirmDelete(false);
    const ops = [
      ...selectedFiles.map((f) => driveApi.deleteFile(f.id)),
      ...selectedFolders.map((f) => driveApi.deleteFolder(f.id)),
    ];
    try {
      await Promise.all(ops);
      setFiles(files.filter((f) => !selectedIds.has(f.id)));
      setFolders(folders.filter((f) => !selectedIds.has(f.id)));
      clearSelection();
      toast.show(`${count} items deleted`);
    } catch {
      toast.show('Some items could not be deleted');
    }
  };

  const handleBulkMove = async (targetFolderId: string) => {
    setMoveOpen(false);
    const ops = selectedFiles.map((f) => driveApi.moveFile(f.id, targetFolderId));
    try {
      await Promise.all(ops);
      setFiles(files.filter((f) => !selectedIds.has(f.id)));
      clearSelection();
      toast.show(`${selectedFiles.length} files moved`);
    } catch {
      toast.show('Some files could not be moved');
    }
  };

  const handleBulkDownload = async () => {
    for (const file of selectedFiles) {
      try {
        const buffer = await driveApi.downloadFile(file.id);
        let blob: Blob;
        if (file.encryptedKey) {
          const keyBytes = Uint8Array.from(atob(file.encryptedKey), (c) => c.charCodeAt(0));
          const data = new Uint8Array(buffer);
          const nonce = data.slice(0, 24);
          const ciphertext = data.slice(24);
          const plaintext = decryptSymmetric({ ciphertext, nonce }, keyBytes);
          blob = new Blob([plaintext.slice().buffer as ArrayBuffer], { type: file.mimeType || 'application/octet-stream' });
        } else {
          blob = new Blob([buffer], { type: file.mimeType || 'application/octet-stream' });
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        // skip failed downloads
      }
    }
    toast.show(`Downloaded ${selectedFiles.length} files`);
  };

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--drive-brand)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 8,
          margin: '0 20px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>
          {count} selected
        </span>

        <div style={{ flex: 1 }} />

        {selectedFiles.length > 0 && (
          <BulkBtn icon={<Download size={14} />} label="Download" onClick={handleBulkDownload} />
        )}
        {selectedFiles.length > 0 && (
          <BulkBtn icon={<FolderInput size={14} />} label="Move" onClick={() => setMoveOpen(true)} />
        )}
        <BulkBtn icon={<Trash2 size={14} />} label="Delete" onClick={() => setConfirmDelete(true)} />

        <button
          onClick={clearSelection}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: '#fff',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            cursor: 'pointer',
            marginLeft: 4,
          }}
          title="Clear selection"
        >
          <X size={14} />
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete selected items?"
          message={`${count} item${count > 1 ? 's' : ''} will be moved to trash.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleBulkDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {moveOpen && (
        <MoveToDialog
          title={`Move ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} to…`}
          onSelect={handleBulkMove}
          onCancel={() => setMoveOpen(false)}
        />
      )}
    </>
  );
}

function BulkBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 10px',
        borderRadius: 6,
        border: 'none',
        background: 'rgba(255,255,255,0.15)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
    >
      {icon}
      {label}
    </button>
  );
}
