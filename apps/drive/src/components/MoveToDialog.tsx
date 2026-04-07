import { useState, useEffect, useRef } from 'react';
import { Folder as FolderIcon, ChevronRight, ArrowLeft } from 'lucide-react';
import { driveApi } from '@/api/client';

interface FolderEntry {
  id: string;
  name: string;
}

interface Props {
  title?: string;
  onSelect: (folderId: string) => void;
  onCancel: () => void;
}

export function MoveToDialog({ title = 'Move to…', onSelect, onCancel }: Props) {
  const [folders, setFolders] = useState<FolderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState('root');
  const [breadcrumb, setBreadcrumb] = useState<FolderEntry[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    driveApi.listFolder(currentId === 'root' ? undefined : currentId)
      .then((res) => {
        setFolders(res.folders.map((f: { id: string; name: string }) => ({ id: f.id, name: f.name })));
      })
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, [currentId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

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
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: 'var(--drive-bg)',
          borderRadius: 12,
          width: 360,
          maxHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--drive-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {currentId !== 'root' && (
            <button
              onClick={navigateBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--drive-text-muted)',
                display: 'flex',
                padding: 2,
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--drive-text)', flex: 1 }}>
            {title}
          </span>
        </div>

        {/* Folder list */}
        <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
          {/* "This folder" option when inside a subfolder */}
          {currentId !== 'root' && (
            <button
              onClick={() => onSelect(currentId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 20px',
                background: 'none',
                border: 'none',
                color: 'var(--drive-brand)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <FolderIcon size={16} />
              Move here
            </button>
          )}

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--drive-text-muted)', fontSize: 13 }}>
              Loading…
            </div>
          ) : folders.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--drive-text-muted)', fontSize: 13 }}>
              {currentId === 'root' ? 'No folders. Create one first.' : 'No subfolders'}
            </div>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => navigateInto(folder)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--drive-text)',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <FolderIcon size={16} style={{ color: 'var(--drive-brand)', flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {folder.name}
                </span>
                <ChevronRight size={14} style={{ color: 'var(--drive-text-muted)' }} />
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--drive-border)',
            display: 'flex',
            gap: 8,
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid var(--drive-border)',
              background: 'none',
              color: 'var(--drive-text)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          {currentId === 'root' && (
            <button
              onClick={() => onSelect('root')}
              style={{
                padding: '7px 14px',
                borderRadius: 6,
                border: 'none',
                background: 'var(--drive-brand)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Move to My Drive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
