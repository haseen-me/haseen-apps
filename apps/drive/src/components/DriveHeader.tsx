import {
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Upload,
  FolderPlus,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useDriveStore } from '@/store/drive';
import type { SortField, SortDir } from '@/types/drive';

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'updatedAt', label: 'Modified' },
  { field: 'size', label: 'Size' },
];

export function DriveHeader() {
  const {
    path,
    setCurrentFolderId,
    viewMode,
    setViewMode,
    sortField,
    sortDir,
    setSort,
    setUploadOpen,
    setNewFolderOpen,
    selectedIds,
    clearSelection,
  } = useDriveStore();

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const breadcrumbs = [{ id: 'root', name: 'My Drive' }, ...path];

  return (
    <div
      style={{
        height: 'var(--drive-header-height)',
        borderBottom: '1px solid var(--drive-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <ChevronRight size={14} style={{ color: 'var(--drive-text-muted)' }} />}
            <button
              onClick={() => setCurrentFolderId(crumb.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--drive-radius-sm)',
                fontSize: 14,
                fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                color: i === breadcrumbs.length - 1 ? 'var(--drive-text)' : 'var(--drive-text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--drive-text-secondary)' }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={clearSelection}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 12,
              color: 'var(--drive-brand)',
              fontWeight: 500,
              padding: '4px 8px',
              borderRadius: 'var(--drive-radius-sm)',
            }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Sort dropdown */}
      <div ref={sortRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setSortOpen(!sortOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 'var(--drive-radius-sm)',
            border: '1px solid var(--drive-border)',
            background: 'var(--drive-bg)',
            fontSize: 13,
            color: 'var(--drive-text-secondary)',
          }}
        >
          <ArrowUpDown size={14} />
          {SORT_OPTIONS.find((s) => s.field === sortField)?.label}
        </button>
        {sortOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              background: 'var(--drive-bg)',
              border: '1px solid var(--drive-border)',
              borderRadius: 'var(--drive-radius)',
              boxShadow: 'var(--drive-shadow-lg)',
              padding: 4,
              minWidth: 160,
              zIndex: 50,
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.field}
                onClick={() => {
                  const newDir: SortDir = sortField === opt.field && sortDir === 'asc' ? 'desc' : 'asc';
                  setSort(opt.field, newDir);
                  setSortOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  padding: '8px 12px',
                  border: 'none',
                  borderRadius: 'var(--drive-radius-sm)',
                  background: sortField === opt.field ? 'var(--drive-brand-subtle)' : 'transparent',
                  color: sortField === opt.field ? 'var(--drive-brand)' : 'var(--drive-text)',
                  fontSize: 13,
                  fontWeight: sortField === opt.field ? 600 : 400,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = sortField === opt.field ? 'var(--drive-brand-subtle)' : 'var(--drive-bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = sortField === opt.field ? 'var(--drive-brand-subtle)' : 'transparent')}
              >
                {opt.label}
                {sortField === opt.field && (
                  <span style={{ fontSize: 11 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View toggle */}
      <div
        style={{
          display: 'flex',
          borderRadius: 'var(--drive-radius-sm)',
          border: '1px solid var(--drive-border)',
          overflow: 'hidden',
        }}
      >
        {(['grid', 'list'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '6px 10px',
              border: 'none',
              background: viewMode === mode ? 'var(--drive-brand)' : 'var(--drive-bg)',
              color: viewMode === mode ? '#fff' : 'var(--drive-text-secondary)',
              display: 'flex',
              transition: 'background 0.12s, color 0.12s',
            }}
          >
            {mode === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
        ))}
      </div>

      {/* New folder */}
      <button
        onClick={() => setNewFolderOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          borderRadius: 'var(--drive-radius-sm)',
          border: '1px solid var(--drive-border)',
          background: 'var(--drive-bg)',
          color: 'var(--drive-text-secondary)',
          fontSize: 13,
        }}
      >
        <FolderPlus size={16} />
      </button>

      {/* Upload */}
      <button
        onClick={() => setUploadOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px',
          borderRadius: 'var(--drive-radius-sm)',
          border: 'none',
          background: 'var(--drive-brand)',
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-brand-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--drive-brand)')}
      >
        <Upload size={16} />
        Upload
      </button>
    </div>
  );
}
