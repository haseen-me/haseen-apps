import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';
import type { Folder } from '@/types/drive';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  folder: Folder;
  contextPos?: { x: number; y: number } | null;
  onCloseContext?: () => void;
}

export function FolderContextMenu({ folder, contextPos, onCloseContext }: Props) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toast = useToastStore();
  const { folders, setFolders } = useDriveStore();

  const isMenuOpen = open || !!contextPos;
  const closeMenu = () => {
    setOpen(false);
    onCloseContext?.();
  };

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

  const handleRename = async () => {
    if (!newName.trim() || newName === folder.name) {
      setRenaming(false);
      return;
    }
    try {
      await driveApi.renameFolder(folder.id, newName.trim());
      setFolders(folders.map((f) => (f.id === folder.id ? { ...f, name: newName.trim() } : f)));
      toast.show('Folder renamed');
    } catch {
      toast.show('Rename failed');
    }
    setRenaming(false);
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    closeMenu();
    try {
      await driveApi.deleteFolder(folder.id);
      setFolders(folders.filter((f) => f.id !== folder.id));
      toast.show('Folder deleted');
    } catch {
      toast.show('Delete failed');
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
            border: '1px solid var(--hsn-cta-primary-default)',
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
    <div ref={menuRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      {!contextPos && (
        <button
          onClick={() => setOpen(!open)}
          title="More actions"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--hsn-text-tertiary)',
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
            background: 'var(--hsn-bg-l1-solid)',
            border: '1px solid var(--hsn-border-primary)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 200,
            minWidth: 150,
            overflow: 'hidden',
          } : {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'var(--hsn-bg-l1-solid)',
            border: '1px solid var(--hsn-border-primary)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            zIndex: 100,
            minWidth: 150,
            overflow: 'hidden',
          }}
        >
          <MenuItem
            icon={<Pencil size={15} />}
            label="Rename"
            onClick={() => {
              closeMenu();
              setNewName(folder.name);
              setRenaming(true);
            }}
          />
          <div style={{ height: 1, background: 'var(--hsn-border-primary)', margin: '4px 0' }} />
          <MenuItem
            icon={<Trash2 size={15} />}
            label="Delete folder"
            onClick={() => {
              closeMenu();
              setConfirmDelete(true);
            }}
            danger
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete folder?"
        message={`"${folder.name}" and all its contents will be permanently deleted.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
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
        color: danger ? '#e5484d' : 'var(--hsn-text-primary)',
        fontSize: 13,
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-bg-cell)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {icon}
      {label}
    </button>
  );
}
