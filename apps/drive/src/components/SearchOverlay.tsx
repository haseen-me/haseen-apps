import { Search, X, FolderIcon, FileText } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useDriveStore } from '@/store/drive';
import { driveApi } from '@/api/client';
import { getFileIcon, formatFileSize } from '@/types/drive';
import type { DriveFile, Folder } from '@/types/drive';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setCurrentFolderId } = useDriveStore();
  const [query, setQuery] = useState('');
  const [matchingFiles, setMatchingFiles] = useState<DriveFile[]>([]);
  const [matchingFolders, setMatchingFolders] = useState<Folder[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setMatchingFiles([]);
      setMatchingFolders([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Debounced API search
  useEffect(() => {
    if (!query.trim()) {
      setMatchingFiles([]);
      setMatchingFolders([]);
      setSearching(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await driveApi.search(query.trim());
        setMatchingFiles(
          (data.files ?? []).map((f) => ({
            id: f.id,
            folderId: f.folderID,
            name: f.name,
            mimeType: f.mimeType,
            size: f.size,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          })),
        );
        setMatchingFolders(
          (data.folders ?? []).map((f) => ({
            id: f.id,
            parentId: f.parentId,
            name: f.name,
            createdAt: f.createdAt,
          })),
        );
      } catch {
        setMatchingFiles([]);
        setMatchingFolders([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setSearchOpen(false);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        zIndex: 100,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--drive-bg)',
          borderRadius: 'var(--drive-radius)',
          boxShadow: 'var(--drive-shadow-lg)',
          width: 520,
          maxWidth: '90vw',
          maxHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 16px',
            borderBottom: '1px solid var(--drive-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--drive-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              fontSize: 15,
              outline: 'none',
              fontFamily: 'inherit',
              color: 'var(--drive-text)',
            }}
          />
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--drive-text-muted)',
              padding: 4,
              display: 'flex',
              borderRadius: 4,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {!query && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--drive-text-muted)', fontSize: 13 }}>
              Type to search files and folders
            </div>
          )}

          {query && !searching && matchingFolders.length === 0 && matchingFiles.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--drive-text-muted)', fontSize: 13 }}>
              No results for &quot;{query}&quot;
            </div>
          )}

          {matchingFolders.length > 0 && (
            <div style={{ padding: '8px 4px' }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--drive-text-muted)',
                textTransform: 'uppercase',
                padding: '4px 12px',
                letterSpacing: '0.04em',
              }}>
                Folders
              </div>
              {matchingFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => { setCurrentFolderId(folder.id); handleClose(); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 'var(--drive-radius-sm)',
                    background: 'transparent',
                    color: 'var(--drive-text)',
                    fontSize: 14,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FolderIcon size={18} style={{ color: 'var(--drive-brand)' }} />
                  {folder.name}
                </button>
              ))}
            </div>
          )}

          {matchingFiles.length > 0 && (
            <div style={{ padding: '8px 4px' }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--drive-text-muted)',
                textTransform: 'uppercase',
                padding: '4px 12px',
                letterSpacing: '0.04em',
              }}>
                Files
              </div>
              {matchingFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 'var(--drive-radius-sm)',
                    background: 'transparent',
                    color: 'var(--drive-text)',
                    fontSize: 14,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileText size={18} style={{ color: getFileIcon(file.mimeType).color }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--drive-text-muted)' }}>{formatFileSize(file.size)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
