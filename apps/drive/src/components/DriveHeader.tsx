import {
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Upload,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Button, IconButton, Dropdown, DropdownItem, Tabs, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import type { Tab } from '@haseen-me/ui';
import { useDriveStore } from '@/store/drive';
import { driveApi } from '@/api/client';
import { useToastStore } from '@haseen-me/shared/toast';
import type { SortField, SortDir } from '@/types/drive';

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'updatedAt', label: 'Modified' },
  { field: 'size', label: 'Size' },
];

const VIEW_TABS: Tab[] = [
  { id: 'grid', label: 'Grid', icon: <LayoutGrid size={14} /> },
  { id: 'list', label: 'List', icon: <List size={14} /> },
];

export function DriveHeader() {
  const {
    currentFolderId,
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
    files,
    setFiles,
  } = useDriveStore();
  const toast = useToastStore();

  const isTrash = currentFolderId === '__trash';
  const isShared = currentFolderId === '__shared';
  const isSpecial = isTrash || isShared;

  const [sortOpen, setSortOpen] = useState(false);
  const sortAnchorRef = useRef<HTMLButtonElement>(null);

  const breadcrumbs = isTrash
    ? [{ id: '__trash', name: 'Trash' }]
    : isShared
      ? [{ id: '__shared', name: 'Shared with me' }]
      : [{ id: 'root', name: 'My Drive' }, ...path];

  return (
    <div
      style={{
        height: 'var(--drive-header-height, 52px)',
        borderBottom: '1px solid var(--hsn-border-primary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        flexShrink: 0,
        background: 'var(--hsn-bg-l1-solid)',
      }}
    >
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {i > 0 && <ChevronRight size={14} style={{ color: 'var(--hsn-icon-secondary)' }} />}
            <button
              onClick={() => setCurrentFolderId(crumb.id)}
              style={{
                background: 'none', border: 'none', padding: '4px 6px', borderRadius: 6,
                fontSize: 14, fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                color: i === breadcrumbs.length - 1 ? 'var(--hsn-text-primary)' : 'var(--hsn-text-secondary)',
                whiteSpace: 'nowrap', cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-bg-cell)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {crumb.name}
            </button>
          </div>
        ))}
      </div>

      {/* Selection info */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)' }}>
            {selectedIds.size} selected
          </Typography>
          <Button type={Type.TERTIARY} size={Size.SMALL} onClick={clearSelection}>Clear</Button>
        </div>
      )}

      {/* Sort */}
      <div style={{ position: 'relative' }}>
        <button
          ref={sortAnchorRef}
          onClick={() => setSortOpen(!sortOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
            borderRadius: 6, border: '1px solid var(--hsn-border-primary)',
            background: 'var(--hsn-bg-field-default)', fontSize: 13, color: 'var(--hsn-text-secondary)', cursor: 'pointer',
          }}
        >
          <ArrowUpDown size={14} />
          {SORT_OPTIONS.find((s) => s.field === sortField)?.label}
        </button>
        <Dropdown open={sortOpen} onClose={() => setSortOpen(false)} anchor={sortAnchorRef} width={160}>
          {SORT_OPTIONS.map((opt) => (
            <DropdownItem
              key={opt.field}
              label={opt.label}
              active={sortField === opt.field}
              endElement={sortField === opt.field ? <span style={{ fontSize: 11 }}>{sortDir === 'asc' ? '↑' : '↓'}</span> : undefined}
              onClick={() => {
                const newDir: SortDir = sortField === opt.field && sortDir === 'asc' ? 'desc' : 'asc';
                setSort(opt.field, newDir);
                setSortOpen(false);
              }}
            />
          ))}
        </Dropdown>
      </div>

      {/* View toggle */}
      <Tabs tabs={VIEW_TABS} activeTab={viewMode} onTabChange={(t) => setViewMode(t as 'grid' | 'list')} />

      {/* New folder */}
      {!isSpecial && (
        <IconButton
          icon={<FolderPlus size={16} />}
          type={Type.SECONDARY}
          size={Size.MEDIUM}
          tooltip="New folder"
          onClick={() => setNewFolderOpen(true)}
        />
      )}

      {/* Upload */}
      {!isSpecial && (
        <Button
          type={Type.PRIMARY}
          size={Size.MEDIUM}
          onClick={() => setUploadOpen(true)}
          startIcon={<Upload size={16} />}
        >
          Upload
        </Button>
      )}

      {/* Empty Trash */}
      {isTrash && files.length > 0 && (
        <Button
          type={Type.DESTRUCTIVE}
          size={Size.MEDIUM}
          startIcon={<Trash2 size={14} />}
          onClick={async () => {
            try {
              await driveApi.emptyTrash();
              setFiles([]);
              toast.show('Trash emptied');
            } catch {
              toast.show('Failed to empty trash');
            }
          }}
        >
          Empty Trash
        </Button>
      )}
    </div>
  );
}
