import { useState } from 'react';
import { FolderIcon } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { useToastStore } from '@haseen-me/shared/toast';
import { driveApi } from '@/api/client';
import type { Folder } from '@/types/drive';
import { FolderContextMenu } from './FolderContextMenu';

export function FolderCard({ folder }: { folder: Folder }) {
  const { setCurrentFolderId, selectedIds, toggleSelected, files, setFiles } = useDriveStore();
  const toast = useToastStore();
  const selected = selectedIds.has(folder.id);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('application/x-drive-file-ids')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOver(true);
    }
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData('application/x-drive-file-ids');
    if (!raw) return;
    try {
      const ids: string[] = JSON.parse(raw);
      await Promise.all(ids.map((id) => driveApi.moveFile(id, folder.id)));
      setFiles(files.filter((f) => !ids.includes(f.id)));
      toast.show(`Moved ${ids.length} file${ids.length > 1 ? 's' : ''} to ${folder.name}`);
    } catch {
      toast.show('Failed to move files');
    }
  };

  return (
    <div
      onClick={() => setCurrentFolderId(folder.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextPos({ x: e.clientX, y: e.clientY });
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: '14px 16px',
        borderRadius: '8px',
        border: `2px solid ${dragOver ? 'var(--hsn-cta-primary-default)' : selected ? 'var(--hsn-cta-primary-default)' : 'var(--hsn-border-primary)'}`,
        background: dragOver ? 'rgba(45,184,175,0.08)' : selected ? 'rgba(45,184,175,0.08)' : 'var(--hsn-bg-l1-solid)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--hsn-border-primary)';
          e.currentTarget.style.background = 'var(--hsn-bg-cell)';
          e.currentTarget.style.boxShadow = 'var(--hsn-shadow-l1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--hsn-border-primary)';
          e.currentTarget.style.background = 'var(--hsn-bg-l1-solid)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div
        onClick={(e) => { e.stopPropagation(); toggleSelected(folder.id); }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 8,
          background: selected ? 'var(--hsn-cta-primary-default)' : 'rgba(45, 184, 175, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: selected ? '#fff' : 'var(--hsn-cta-primary-default)',
          flexShrink: 0,
        }}
      >
        <FolderIcon size={20} />
      </div>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--hsn-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,
      }}>
        {folder.name}
      </span>
      <FolderContextMenu folder={folder} />
      {contextPos && (
        <FolderContextMenu
          folder={folder}
          contextPos={contextPos}
          onCloseContext={() => setContextPos(null)}
        />
      )}
    </div>
  );
}
