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
} from 'lucide-react';
import { useState } from 'react';
import { useDriveStore } from '@/store/drive';
import { MOCK_FOLDERS } from '@/data/mock';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'root', label: 'My Drive', icon: <HardDrive size={18} /> },
  { id: '__recent', label: 'Recent', icon: <Clock size={18} /> },
  { id: '__shared', label: 'Shared with me', icon: <Share2 size={18} /> },
  { id: '__trash', label: 'Trash', icon: <Trash2 size={18} /> },
];

export function Sidebar() {
  const {
    currentFolderId,
    setCurrentFolderId,
    setSearchOpen,
    setNewFolderOpen,
    setUploadOpen,
  } = useDriveStore();

  const [collapsed, setCollapsed] = useState(false);
  const [foldersExpanded, setFoldersExpanded] = useState(true);

  const rootFolders = MOCK_FOLDERS.filter((f) => f.parentId === null);

  return (
    <aside
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'var(--drive-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              H
            </div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Drive</span>
          </div>
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
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--drive-border)',
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--drive-text-muted)', marginBottom: 6 }}>
            2.4 GB of 15 GB used
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
                width: '16%',
                height: '100%',
                borderRadius: 2,
                background: 'var(--drive-brand)',
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
