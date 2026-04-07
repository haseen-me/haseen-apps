import {
  HardDrive,
  FolderIcon,
  Share2,
  Trash2,
  Clock,
  Plus,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronDown,
  Star,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDriveStore } from '@/store/drive';
import { driveApi } from '@/api/client';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'root', label: 'My Drive', icon: <HardDrive size={18} /> },
  { id: '__recent', label: 'Recent', icon: <Clock size={18} /> },
  { id: '__starred', label: 'Starred', icon: <Star size={18} /> },
  { id: '__shared', label: 'Shared with me', icon: <Share2 size={18} /> },
  { id: '__trash', label: 'Trash', icon: <Trash2 size={18} /> },
];

export function Sidebar({ mobileSidebarOpen }: { mobileSidebarOpen?: boolean }) {
  const {
    currentFolderId,
    setCurrentFolderId,
    setSearchOpen,
    setNewFolderOpen,
    setUploadOpen,
  } = useDriveStore();

  const [collapsed, setCollapsed] = useState(false);
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [rootFolders, setRootFolders] = useState<Array<{ id: string; name: string; parentId: string | null; createdAt: string }>>([]);

  // Load root folders on mount
  useEffect(() => {
    let cancelled = false;
    driveApi.listFolder().then((data) => {
      if (!cancelled) setRootFolders(data.folders.map((f) => ({ id: f.id, name: f.name, parentId: f.parentId, createdAt: f.createdAt })));
    }).catch(() => {
      // silently fail — sidebar will show no folders
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <aside
      className={`drive-sidebar${mobileSidebarOpen ? ' mobile-open' : ''}`}
      style={{
        width: collapsed ? 64 : 'var(--drive-sidebar-width)',
        height: '100vh',
        borderRight: '1px solid var(--drive-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--drive-bg-secondary)',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 'var(--drive-header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 12px 0 16px',
          borderBottom: '1px solid var(--drive-border)',
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--drive-text)' }}>Drive</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--drive-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Actions */}
      <div style={{ padding: collapsed ? '12px 8px' : '12px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          onClick={() => setUploadOpen(true)}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 'var(--drive-radius)',
            background: 'var(--drive-brand)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--drive-brand-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--drive-brand)')}
        >
          <Plus size={16} />
          {!collapsed && 'Upload'}
        </button>

        {!collapsed && (
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--drive-radius-sm)',
              background: 'var(--drive-bg)',
              border: '1px solid var(--drive-border)',
              color: 'var(--drive-text-muted)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Search size={14} />
            <span>Search files...</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.6 }}>⌘K</span>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflow: 'auto', padding: collapsed ? '4px 8px' : '4px 8px' }}>
        {NAV_ITEMS.map((item) => {
          const active = currentFolderId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentFolderId(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '8px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--drive-radius-sm)',
                border: 'none',
                background: active ? 'var(--drive-brand-subtle)' : 'transparent',
                color: active ? 'var(--drive-brand)' : 'var(--drive-text)',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: 'background 0.12s',
                marginBottom: 2,
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--drive-bg-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {item.icon}
              {!collapsed && item.label}
            </button>
          );
        })}

        {/* Folder tree */}
        {!collapsed && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setFoldersExpanded(!foldersExpanded)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                color: 'var(--drive-text-muted)',
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {foldersExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Folders
              <button
                onClick={(e) => { e.stopPropagation(); setNewFolderOpen(true); }}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  padding: 2,
                  color: 'var(--drive-text-muted)',
                  display: 'flex',
                  borderRadius: 4,
                }}
                title="New folder"
              >
                <Plus size={14} />
              </button>
            </button>

            {foldersExpanded && rootFolders.map((folder) => {
              const active = currentFolderId === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 12px 7px 24px',
                    border: 'none',
                    borderRadius: 'var(--drive-radius-sm)',
                    background: active ? 'var(--drive-brand-subtle)' : 'transparent',
                    color: active ? 'var(--drive-brand)' : 'var(--drive-text)',
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                    transition: 'background 0.12s',
                    marginBottom: 1,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--drive-bg-hover)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <FolderIcon size={16} />
                  {folder.name}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Storage indicator */}
      {!collapsed && (
        <StorageIndicator />
      )}
    </aside>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function StorageIndicator() {
  const [used, setUsed] = useState(0);
  const [total, setTotal] = useState(10 * 1024 * 1024 * 1024); // 10 GB default

  useEffect(() => {
    driveApi.getStorageUsage()
      .then((res) => {
        setUsed(res.usedBytes);
        setTotal(res.totalBytes);
      })
      .catch(() => {
        // Fallback: count client-side files
      });
  }, []);

  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--drive-border)',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--drive-text-muted)', marginBottom: 6 }}>
        {formatBytes(used)} of {formatBytes(total)} used
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: 'var(--drive-border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.max(pct, 0.5)}%`,
            height: '100%',
            borderRadius: 2,
            background: pct > 90 ? '#dc3545' : 'var(--drive-brand)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}
