import { useState, useEffect } from 'react';
import { Folder as FolderIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { Dialog, Button, IconButton, Skeleton, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import { driveApi } from '@/api/client';

interface FolderEntry {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  title?: string;
  onSelect: (folderId: string) => void;
  onCancel: () => void;
}

export function MoveToDialog({ open, title = 'Move to…', onSelect, onCancel }: Props) {
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState('root');
  const [breadcrumb, setBreadcrumb] = useState<FolderEntry[]>([]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    driveApi.listFolder(currentId === 'root' ? undefined : currentId)
      .then((res) => setFolders(res.folders.map((f: { id: string; name: string }) => ({ id: f.id, name: f.name }))))
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, [currentId, open]);

  const navigateInto = (folder: FolderEntry) => {
    setBreadcrumb((prev) => [...prev, { id: currentId, name: currentId === 'root' ? 'My Drive' : breadcrumb[breadcrumb.length - 1]?.name || 'My Drive' }]);
    setCurrentId(folder.id);
  };

  const navigateBack = () => {
    const prev = breadcrumb[breadcrumb.length - 1];
    if (prev) {
      setBreadcrumb((b) => b.slice(0, -1));
      setCurrentId(prev.id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      style={{ padding: 0, maxWidth: 380 }}
      actions={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={onCancel}>Cancel</Button>
          {currentId === 'root' && (
            <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={() => onSelect('root')}>
              Move to My Drive
            </Button>
          )}
        </div>
      }
    >
      {/* Back navigation */}
      {currentId !== 'root' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <IconButton icon={<ArrowLeft size={16} />} type={Type.TERTIARY} size={Size.SMALL} onClick={navigateBack} />
          <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)' }}>
            {breadcrumb.map((b) => b.name).join(' › ')}
          </Typography>
        </div>
      )}

      <div style={{ maxHeight: 300, overflow: 'auto' }}>
        {currentId !== 'root' && (
          <button
            onClick={() => onSelect(currentId)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 4px',
              background: 'none', border: 'none', color: 'var(--hsn-accent-teal)', fontSize: 13, fontWeight: 600, cursor: 'pointer', borderRadius: 6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-bg-cell)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <FolderIcon size={16} /> Move here
          </button>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 0' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 36, borderRadius: 6 }} />)}
          </div>
        ) : folders.length === 0 ? (
          <Typography size={TypographySize.BODY} style={{ padding: '16px 0', textAlign: 'center', color: 'var(--hsn-text-tertiary)' }}>
            {currentId === 'root' ? 'No folders. Create one first.' : 'No subfolders'}
          </Typography>
        ) : (
          folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => navigateInto(folder)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 4px',
                background: 'none', border: 'none', color: 'var(--hsn-text-primary)', fontSize: 13, cursor: 'pointer', textAlign: 'left', borderRadius: 6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-bg-cell)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <FolderIcon size={16} style={{ color: 'var(--hsn-accent-teal)', flexShrink: 0 }} />
              <Typography size={TypographySize.BODY} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {folder.name}
              </Typography>
              <ChevronRight size={14} style={{ color: 'var(--hsn-icon-secondary)' }} />
            </button>
          ))
        )}
      </div>
    </Dialog>
  );
}
