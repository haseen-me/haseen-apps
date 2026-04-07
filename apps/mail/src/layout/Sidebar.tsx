import {
  Inbox,
  Star,
  Send,
  FileEdit,
  Archive,
  AlertTriangle,
  Trash2,
  Plus,
  Tag,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState } from 'react';
import { useMailStore } from '@/store/mail';
import type { SystemLabel } from '@/types/mail';
import { SYSTEM_LABELS } from '@/types/mail';
import { LabelDialog } from '@/components/LabelDialog';

const LABEL_ICONS: Record<SystemLabel, React.ReactNode> = {
  inbox: <Inbox size={18} />,
  starred: <Star size={18} />,
  sent: <Send size={18} />,
  drafts: <FileEdit size={18} />,
  archive: <Archive size={18} />,
  spam: <AlertTriangle size={18} />,
  trash: <Trash2 size={18} />,
};

export function Sidebar({ mobileSidebarOpen }: { mobileSidebarOpen?: boolean }) {
  const {
    activeLabel,
    setActiveLabel,
    setComposeOpen,
    sidebarCollapsed,
    toggleSidebar,
    threads,
    userLabels,
    setSearchOpen,
  } = useMailStore();
  const [labelDialogOpen, setLabelDialogOpen] = useState(false);

  const inboxUnread = threads.filter(
    (t) => t.labels.includes('inbox') && t.unreadCount > 0
  ).length;

  const countForLabel = (labelId: string) =>
    threads.filter((t) => t.labels.includes(labelId) && t.unreadCount > 0).length;

  return (
    <>
    <aside
      className={`mail-sidebar${mobileSidebarOpen ? ' mobile-open' : ''}`}
      style={{
        width: sidebarCollapsed ? 'var(--mail-sidebar-collapsed)' : 'var(--mail-sidebar-width)',
        height: '100vh',
        borderRight: '1px solid var(--mail-border)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mail-bg-secondary)',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 'var(--mail-header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? '0' : '0 12px 0 16px',
          borderBottom: '1px solid var(--mail-border)',
          flexShrink: 0,
        }}
      >
        {!sidebarCollapsed && (
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--mail-text)' }}>Mail</span>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mail-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
          }}
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Compose button */}
      <div style={{ padding: sidebarCollapsed ? '12px 8px' : '12px', flexShrink: 0 }}>
        <button
          onClick={() => setComposeOpen(true)}
          style={{
            width: '100%',
            padding: sidebarCollapsed ? '10px 0' : '10px 0',
            borderRadius: 'var(--mail-radius)',
            background: 'var(--mail-brand)',
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
        >
          <Plus size={16} />
          {!sidebarCollapsed && 'Compose'}
        </button>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 'var(--mail-radius-sm)',
              border: '1px solid var(--mail-border)',
              background: 'var(--mail-bg)',
              color: 'var(--mail-text-muted)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Search size={14} />
            Search mail...
          </button>
        </div>
      )}

      {/* System labels */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
        {SYSTEM_LABELS.map((label) => {
          const isActive = activeLabel === label.id;
          const unread = countForLabel(label.id);
          return (
            <button
              key={label.id}
              onClick={() => setActiveLabel(label.id)}
              title={sidebarCollapsed ? label.name : undefined}
              style={{
                width: '100%',
                padding: sidebarCollapsed ? '8px 0' : '6px 10px',
                borderRadius: 'var(--mail-radius-sm)',
                background: isActive ? 'var(--mail-brand-subtle)' : 'transparent',
                color: isActive ? 'var(--mail-brand)' : 'var(--mail-text-secondary)',
                border: 'none',
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                gap: 10,
                marginBottom: 2,
                transition: 'all 0.1s',
                cursor: 'pointer',
              }}
            >
              {LABEL_ICONS[label.id]}
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left' }}>{label.name}</span>
                  {unread > 0 && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--mail-brand)',
                        background: 'var(--mail-brand-subtle)',
                        padding: '1px 7px',
                        borderRadius: 10,
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}

        {/* User labels */}
        {!sidebarCollapsed && (
          <div style={{ marginTop: 16 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--mail-text-muted)',
                padding: '4px 10px',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Tag size={11} /> Labels
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setLabelDialogOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mail-text-muted)',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                }}
                title="Manage labels"
              >
                <Plus size={12} />
              </button>
            </div>
            {userLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => setActiveLabel(label.id)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--mail-radius-sm)',
                  background: activeLabel === label.id ? 'var(--mail-brand-subtle)' : 'transparent',
                  color: activeLabel === label.id ? 'var(--mail-brand)' : 'var(--mail-text-secondary)',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: activeLabel === label.id ? 500 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: label.color,
                    flexShrink: 0,
                  }}
                />
                {label.name}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--mail-border)',
            fontSize: 11,
            color: 'var(--mail-text-muted)',
            flexShrink: 0,
          }}
        >
          Haseen Mail · E2E Encrypted
        </div>
      )}
    </aside>
    <LabelDialog open={labelDialogOpen} onClose={() => setLabelDialogOpen(false)} />
    </>
  );
}
