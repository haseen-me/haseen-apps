import {
  File,
  FileText,
  Image,
  Video,
  Music,
  Table,
  Presentation,
  Archive,
  FileCode,
  Star,
} from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import type { DriveFile } from '@/types/drive';
import { getFileIcon, formatFileSize } from '@/types/drive';
import { FileContextMenu } from './FileContextMenu';
import { useState } from 'react';

const ICON_MAP: Record<string, React.ReactNode> = {
  file: <File size={22} />,
  'file-text': <FileText size={22} />,
  image: <Image size={22} />,
  video: <Video size={22} />,
  music: <Music size={22} />,
  table: <Table size={22} />,
  presentation: <Presentation size={22} />,
  archive: <Archive size={22} />,
  'file-code': <FileCode size={22} />,
};

function FileIcon({ mimeType }: { mimeType: string }) {
  const { icon, color } = getFileIcon(mimeType);
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: color + '14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      {ICON_MAP[icon] || <File size={22} />}
    </div>
  );
}

export function FileCard({ file, isTrash }: { file: DriveFile; isTrash?: boolean }) {
  const { selectedIds, toggleSelected, setPreviewFileId } = useDriveStore();
  const selected = selectedIds.has(file.id);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    const ids = selectedIds.has(file.id) ? Array.from(selectedIds) : [file.id];
    e.dataTransfer.setData('application/x-drive-file-ids', JSON.stringify(ids));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => toggleSelected(file.id)}
      onDoubleClick={() => setPreviewFileId(file.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextPos({ x: e.clientX, y: e.clientY });
      }}
      style={{
        padding: 16,
        borderRadius: '8px',
        border: `1px solid ${selected ? 'var(--hsn-cta-primary-default)' : 'var(--hsn-border-primary)'}`,
        background: selected ? 'rgba(45,184,175,0.08)' : 'var(--hsn-bg-l1-solid)',
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'var(--hsn-bg-cell)';
          e.currentTarget.style.boxShadow = 'var(--hsn-shadow-l1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'var(--hsn-bg-l1-solid)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Thumbnail / icon area */}
      <div
        style={{
          height: 100,
          borderRadius: '6px',
          background: 'var(--hsn-bg-l0-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <FileIcon mimeType={file.mimeType} />
        {file.starred && (
          <Star
            size={14}
            fill="#f59e0b"
            color="#f59e0b"
            style={{ position: 'absolute', top: 8, right: 8 }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--hsn-text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={file.name}
          >
            {file.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--hsn-text-tertiary)', marginTop: 2 }}>
            {formatFileSize(file.size)}
          </div>
        </div>
        <FileContextMenu file={file} isTrash={isTrash} />
        {contextPos && (
          <FileContextMenu
            file={file}
            isTrash={isTrash}
            contextPos={contextPos}
            onCloseContext={() => setContextPos(null)}
          />
        )}
      </div>
    </div>
  );
}

export function FileRow({ file, isTrash }: { file: DriveFile; isTrash?: boolean }) {
  const { selectedIds, toggleSelected, setPreviewFileId } = useDriveStore();
  const selected = selectedIds.has(file.id);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);

  const date = new Date(file.updatedAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const handleDragStart = (e: React.DragEvent) => {
    const ids = selectedIds.has(file.id) ? Array.from(selectedIds) : [file.id];
    e.dataTransfer.setData('application/x-drive-file-ids', JSON.stringify(ids));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!isTrash}
      onDragStart={handleDragStart}
      onClick={() => toggleSelected(file.id)}
      onDoubleClick={() => setPreviewFileId(file.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        setContextPos({ x: e.clientX, y: e.clientY });
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: '6px',
        background: selected ? 'rgba(45,184,175,0.08)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--hsn-bg-cell)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = selected ? 'rgba(45,184,175,0.08)' : 'transparent'; }}
    >
      <FileIcon mimeType={file.mimeType} />
      {file.starred && (
        <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ flexShrink: 0 }} />
      )}
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--hsn-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {file.name}
      </span>
      <span style={{ fontSize: 13, color: 'var(--hsn-text-tertiary)', width: 120, textAlign: 'right' }}>
        {dateStr}
      </span>
      <span style={{ fontSize: 13, color: 'var(--hsn-text-tertiary)', width: 80, textAlign: 'right' }}>
        {formatFileSize(file.size)}
      </span>
      <FileContextMenu file={file} isTrash={isTrash} />
      {contextPos && (
        <FileContextMenu
          file={file}
          isTrash={isTrash}
          contextPos={contextPos}
          onCloseContext={() => setContextPos(null)}
        />
      )}
    </div>
  );
}
