import { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Download,
  Pencil,
  Trash2,
  Share2,
  RotateCcw,
  FolderInput,
  Star,
} from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';
import type { DriveFile } from '@/types/drive';
import { decryptSymmetric } from '@haseen-me/crypto';
import { ConfirmDialog } from './ConfirmDialog';
import { MoveToDialog } from './MoveToDialog';

interface Props {
  file: DriveFile;
  isTrash?: boolean;
  contextPos?: { x: number; y: number } | null;
  onCloseContext?: () => void;
}

export function FileContextMenu({ file, isTrash, contextPos, onCloseContext }: Props) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToastStore();
  const { files, setFiles, setShareDialogFileId } = useDriveStore();

  const isMenuOpen = open || !!contextPos;
  const closeMenu = () => {
    setOpen(false);
    onCloseContext?.();
  };

  // Close on click outside
  useEffect(() => {
    if (!isMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMenuOpen]);

  const handleDownload = async () => {
    closeMenu();
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
      toast.show('Download failed');
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === file.name) {
      setRenaming(false);
      return;
    }
    try {
      await driveApi.renameFile(file.id, newName.trim());
      setFiles(files.map((f) => (f.id === file.id ? { ...f, name: newName.trim() } : f)));
      toast.show('File renamed');
    } catch {
      toast.show('Rename failed');
    }
    setRenaming(false);
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    closeMenu();
    const removedFile = file;
    setFiles(files.filter((f) => f.id !== file.id));

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      try {
        await driveApi.deleteFile(removedFile.id);
      } catch {
        const cur = useDriveStore.getState().files;
        setFiles([...cur, removedFile]);
        toast.show('Delete failed');
      }
    }, 5000);

    toast.show('Moved to trash', {
      countdown: 5,
      action: {
        label: 'Undo',
        onClick: () => {
          cancelled = true;
          clearTimeout(timer);
          const cur = useDriveStore.getState().files;
          setFiles([...cur, removedFile]);
        },
      },
    });
  };

  const handleRestore = async () => {
    closeMenu();
    try {
      await driveApi.restoreFile(file.id);
      setFiles(files.filter((f) => f.id !== file.id));
      toast.show('File restored');
    } catch {
      toast.show('Restore failed');
    }
  };

  const handleShare = () => {
    closeMenu();
    setShareDialogFileId(file.id);
  };

  const handleMove = async (targetFolderId: string) => {
    setMoveOpen(false);
    try {
      await driveApi.moveFile(file.id, targetFolderId);
      setFiles(files.filter((f) => f.id !== file.id));
      toast.show('File moved');
    } catch {
      toast.show('Move failed');
    }
  };

  const handleToggleStar = async () => {
    closeMenu();
    const newStarred = !file.starred;
    try {
      await driveApi.starFile(file.id, newStarred);
      setFiles(files.map((f) => (f.id === file.id ? { ...f, starred: newStarred } : f)));
      toast.show(newStarred ? 'Starred' : 'Unstarred');
    } catch {
      toast.show('Failed to update');
    }
  };

  if (renaming) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRename();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', gap: 4, alignItems: 'center' }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          autoFocus
          onBlur={handleRename}
          style={{
            fontSize: 13,
            padding: '2px 6px',
            border: '1px solid var(--drive-brand)',
            borderRadius: 4,
            outline: 'none',
            background: 'var(--drive-bg)',
            color: 'var(--drive-text)',
            width: 140,
          }}
        />
      </form>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      {!contextPos && (
        <button
          onClick={() => setOpen(!open)}
          title="More actions"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--drive-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            cursor: 'pointer',
          }}
        >
          <MoreVertical size={16} />
        </button>
      )}
      {isMenuOpen && (
        <div
          style={contextPos ? {
            position: 'fixed',
            top: contextPos.y,
            left: contextPos.x,
            background: 'var(--drive-bg)',
            border: '1px solid var(--drive-border)',
            borderRadius: 'var(--drive-radius)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 200,
            minWidth: 160,
            overflow: 'hidden',
          } : {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--drive-bg)',
            border: '1px solid var(--drive-border)',
            borderRadius: 'var(--drive-radius)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 100,
            minWidth: 160,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon={<Download size={15} />}
            label="Download"
            onClick={handleDownload}
          />
          {isTrash ? (
            <MenuItem
              icon={<RotateCcw size={15} />}
              label="Restore"
              onClick={handleRestore}
            />
          ) : (
            <>
              <MenuItem
                icon={<Pencil size={15} />}
                label="Rename"
                onClick={() => {
                  closeMenu();
                  setNewName(file.name);
                  setRenaming(true);
                }}
              />
              <MenuItem
                icon={<Share2 size={15} />}
                label="Share"
                onClick={handleShare}
              />
              <MenuItem
                icon={<Star size={15} style={file.starred ? { fill: 'var(--drive-warning, #f5a623)', color: 'var(--drive-warning, #f5a623)' } : undefined} />}
                label={file.starred ? 'Unstar' : 'Star'}
                onClick={handleToggleStar}
              />
              <MenuItem
                icon={<FolderInput size={15} />}
                label="Move to…"
                onClick={() => {
                  closeMenu();
                  setMoveOpen(true);
                }}
              />
              <div style={{ height: 1, background: 'var(--drive-border)', margin: '4px 0' }} />
              <MenuItem
                icon={<Trash2 size={15} />}
                label="Move to trash"
                onClick={() => {
                  closeMenu();
                  setConfirmDelete(true);
                }}
                danger
              />
            </>
          )}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Move to trash?"
          message={`"${file.name}" will be moved to trash. You can restore it later.`}
          confirmLabel="Move to trash"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {moveOpen && (
        <MoveToDialog
          title={`Move "${file.name}" to…`}
          onSelect={handleMove}
          onCancel={() => setMoveOpen(false)}
        />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '8px 12px',
        background: 'none',
        border: 'none',
        color: danger ? '#e5484d' : 'var(--drive-text)',
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {icon}
      {label}
    </button>
  );
}
