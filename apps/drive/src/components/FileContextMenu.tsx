import { useState, useRef } from 'react';
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
import { IconButton, Dropdown, DropdownItem, DropdownItemColor, Type, Size } from '@haseen-me/ui';
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
  const anchorRef = useRef<HTMLButtonElement>(null);
  const toast = useToastStore();
  const { files, setFiles, setShareDialogFileId } = useDriveStore();

  const isMenuOpen = open || !!contextPos;
  const closeMenu = () => {
    setOpen(false);
    onCloseContext?.();
  };

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
            border: '1px solid var(--hsn-accent-teal)',
            borderRadius: 4,
            outline: 'none',
            background: 'var(--hsn-bg-l1-solid)',
            color: 'var(--hsn-text-primary)',
            width: 140,
          }}
        />
      </form>
    );
  }

  return (
    <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      {!contextPos && (
        <IconButton
          ref={anchorRef}
          icon={<MoreVertical size={16} />}
          onClick={() => setOpen(!open)}
          type={Type.TERTIARY}
          size={Size.SMALL}
          tooltip="More actions"
        />
      )}

      <Dropdown open={isMenuOpen} onClose={closeMenu} anchor={anchorRef} width={180} style={contextPos ? { position: 'fixed', top: contextPos.y, left: contextPos.x } : undefined}>
        <DropdownItem label="Download" icon={<Download size={15} />} onClick={handleDownload} />
        {isTrash ? (
          <DropdownItem label="Restore" icon={<RotateCcw size={15} />} onClick={handleRestore} />
        ) : (
          <>
            <DropdownItem label="Rename" icon={<Pencil size={15} />} onClick={() => { closeMenu(); setNewName(file.name); setRenaming(true); }} />
            <DropdownItem label="Share" icon={<Share2 size={15} />} onClick={handleShare} />
            <DropdownItem label={file.starred ? 'Unstar' : 'Star'} icon={<Star size={15} />} onClick={handleToggleStar} />
            <DropdownItem label="Move to…" icon={<FolderInput size={15} />} onClick={() => { closeMenu(); setMoveOpen(true); }} />
            <DropdownItem label="Move to trash" icon={<Trash2 size={15} />} color={DropdownItemColor.DESTRUCTIVE} onClick={() => { closeMenu(); setConfirmDelete(true); }} />
          </>
        )}
      </Dropdown>

      <ConfirmDialog
        open={confirmDelete}
        title="Move to trash?"
        message={`"${file.name}" will be moved to trash. You can restore it later.`}
        confirmLabel="Move to trash"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <MoveToDialog
        open={moveOpen}
        title={`Move "${file.name}" to…`}
        onSelect={handleMove}
        onCancel={() => setMoveOpen(false)}
      />
    </div>
  );
}

