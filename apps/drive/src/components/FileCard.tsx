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
} from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import type { DriveFile } from '@/types/drive';
import { getFileIcon, formatFileSize } from '@/types/drive';

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

export function FileCard({ file }: { file: DriveFile }) {
  const { selectedIds, toggleSelected } = useDriveStore();
  const selected = selectedIds.has(file.id);

  return (
    <div
      onClick={() => toggleSelected(file.id)}
      style={{
        padding: 16,
        borderRadius: 'var(--drive-radius)',
        border: `1px solid ${selected ? 'var(--drive-brand)' : 'var(--drive-border)'}`,
        background: selected ? 'var(--drive-brand-subtle)' : 'var(--drive-bg)',
        cursor: 'pointer',
        transition: 'border-color 0.12s, background 0.12s, box-shadow 0.12s',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 12,
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'var(--drive-bg-hover)';
          e.currentTarget.style.boxShadow = 'var(--drive-shadow)';
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = 'var(--drive-bg)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {/* Thumbnail / icon area */}
      <div
        style={{
          height: 100,
          borderRadius: 'var(--drive-radius-sm)',
          background: 'var(--drive-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FileIcon mimeType={file.mimeType} />
      </div>

      {/* Info */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--drive-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={file.name}
        >
          {file.name}
        </div>
        <div style={{ fontSize: 12, color: 'var(--drive-text-muted)', marginTop: 2 }}>
          {formatFileSize(file.size)}
        </div>
      </div>
    </div>
  );
}

export function FileRow({ file }: { file: DriveFile }) {
  const { selectedIds, toggleSelected } = useDriveStore();
  const selected = selectedIds.has(file.id);

  const date = new Date(file.updatedAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      onClick={() => toggleSelected(file.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderRadius: 'var(--drive-radius-sm)',
        background: selected ? 'var(--drive-brand-subtle)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.12s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--drive-bg-hover)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = selected ? 'var(--drive-brand-subtle)' : 'transparent'; }}
    >
      <FileIcon mimeType={file.mimeType} />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--drive-text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {file.name}
      </span>
      <span style={{ fontSize: 13, color: 'var(--drive-text-muted)', width: 120, textAlign: 'right' }}>
        {dateStr}
      </span>
      <span style={{ fontSize: 13, color: 'var(--drive-text-muted)', width: 80, textAlign: 'right' }}>
        {formatFileSize(file.size)}
      </span>
    </div>
  );
}
