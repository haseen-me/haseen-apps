import { FolderPlus } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Dialog, InputField, Input, InputType, Button, Type, Size } from '@haseen-me/ui';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';

export function NewFolderDialog() {
  const { newFolderOpen, setNewFolderOpen, currentFolderId, folders, setFolders } = useDriveStore();
  const toast = useToastStore();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    try {
      const parentID = currentFolderId === 'root' ? undefined : currentFolderId;
      const folder = await driveApi.createFolder({ name: name.trim(), parentID });
      setFolders([...folders, { id: folder.id, name: folder.name, parentId: folder.parentId, createdAt: folder.createdAt }]);
      toast.show('Folder created');
    } catch {
      toast.show('Failed to create folder');
    } finally {
      setCreating(false);
      setName('');
      setNewFolderOpen(false);
    }
  }, [name, creating, currentFolderId, folders, setFolders, setNewFolderOpen, toast]);

  const handleClose = useCallback(() => {
    setName('');
    setNewFolderOpen(false);
  }, [setNewFolderOpen]);

  return (
    <Dialog
      open={newFolderOpen}
      onClose={handleClose}
      title="New Folder"
      actions={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={handleClose}>Cancel</Button>
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={handleCreate} disabled={!name.trim()} loading={creating} startIcon={<FolderPlus size={16} />}>
            Create
          </Button>
        </div>
      }
    >
      <InputField label="Folder name">
        <Input
          type={InputType.TEXT}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
          placeholder="Folder name"
          autoFocus
        />
      </InputField>
    </Dialog>
  );
}
