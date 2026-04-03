import { FolderIcon } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import type { Folder } from '@/types/drive';

export function FolderCard({ folder }: { folder: Folder }) {
  const { setCurrentFolderId, selectedIds, toggleSelected } = useDriveStore();
  const selected = selectedIds.has(folder.id);

  return (
    <div
      onClick={() => setCurrentFolderId(folder.id)}
      style={{
        padding: '14px 16px',
        borderRadius: 'var(--drive-radius)',
        border: `1px solid ${selected ? 'var(--drive-brand)' : 'var(--drive-border)'}`,
        background: selected ? 'var(--drive-brand-subtle)' : 'var(--drive-bg)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--drive-border)';
          e.currentTarget.style.background = 'var(--drive-bg-hover)';
          e.currentTarget.style.boxShadow = 'var(--drive-shadow)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = 'var(--drive-border)';
          e.currentTarget.style.background = 'var(--drive-bg)';
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
          background: selected ? 'var(--drive-brand)' : 'rgba(45, 184, 175, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: selected ? '#fff' : 'var(--drive-brand)',
          flexShrink: 0,
        }}
      >
        <FolderIcon size={20} />
      </div>
      <span style={{
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--drive-text)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {folder.name}
      </span>
    </div>
  );
}
