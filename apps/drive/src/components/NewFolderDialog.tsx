import { X, FolderPlus } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useDriveStore } from '@/store/drive';

export function NewFolderDialog() {
  const { newFolderOpen, setNewFolderOpen } = useDriveStore();
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newFolderOpen) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [newFolderOpen]);

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    // In real app, call api.createFolder
    setName('');
    setNewFolderOpen(false);
  }, [name, setNewFolderOpen]);

  const handleClose = useCallback(() => {
    setName('');
    setNewFolderOpen(false);
  }, [setNewFolderOpen]);

  if (!newFolderOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          width: 400,
          maxWidth: '90vw',
          padding: 24,
          animation: 'fadeIn 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderPlus size={20} style={{ color: 'var(--drive-brand)' }} />
            New folder
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--drive-text-muted)',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Folder name"
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 'var(--drive-radius-sm)',
            border: '1px solid var(--drive-border)',
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--drive-radius-sm)',
              border: '1px solid var(--drive-border)',
              background: 'var(--drive-bg)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--drive-text)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--drive-radius-sm)',
              border: 'none',
              background: name.trim() ? 'var(--drive-brand)' : 'var(--drive-border)',
              color: name.trim() ? '#fff' : 'var(--drive-text-muted)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
