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
  Globe,
} from 'lucide-react';
import { useState } from 'react';
import { Button, IconButton, Type, Size, Typography, TypographySize } from '@haseen-me/ui';
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
        width: sidebarCollapsed ? 'var(--mail-sidebar-collapsed, 64px)' : 'var(--mail-sidebar-width, 240px)',
        height: '100%',
        borderRight: '1px solid var(--hsn-border-primary)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--hsn-bg-sidepanel)',
        transition: 'width 0.2s ease',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 'var(--mail-header-height, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? '0' : '0 8px 0 16px',
          borderBottom: '1px solid var(--hsn-border-primary)',
          flexShrink: 0,
        }}
      >
        {!sidebarCollapsed && (
          <Typography size={TypographySize.LARGE} style={{ fontWeight: 600 }}>Mail</Typography>
        )}
        <IconButton
          icon={sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          onClick={toggleSidebar}
          type={Type.TERTIARY}
          size={Size.SMALL}
          tooltip={sidebarCollapsed ? 'Expand' : 'Collapse'}
        />
      </div>

      {/* Compose button */}
      <div style={{ padding: sidebarCollapsed ? '12px 8px' : '12px', flexShrink: 0 }}>
        {sidebarCollapsed ? (
          <IconButton
            icon={<Plus size={18} />}
            onClick={() => setComposeOpen(true)}
            type={Type.PRIMARY}
            size={Size.MEDIUM}
            tooltip="Compose"
          />
        ) : (
          <Button
            type={Type.PRIMARY}
            size={Size.MEDIUM}
            fullWidth
            onClick={() => setComposeOpen(true)}
            startIcon={<Plus size={16} />}
          >
            Compose
          </Button>
        )}
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div style={{ padding: '0 12px 8px', flexShrink: 0 }}>
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 6,
              border: '1px solid var(--hsn-border-primary)',
              background: 'var(--hsn-bg-field-default)',
              color: 'var(--hsn-text-tertiary)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Search size={14} />
            Search mail…
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
                borderRadius: 6,
                background: isActive ? 'rgba(45, 184, 175, 0.1)' : 'transparent',
                color: isActive ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-secondary)',
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
                        color: 'var(--hsn-accent-teal)',
                        background: 'rgba(45, 184, 175, 0.1)',
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
                color: 'var(--hsn-text-tertiary)',
                padding: '4px 10px',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Tag size={11} /> Labels
              <div style={{ flex: 1 }} />
              <IconButton
                icon={<Plus size={12} />}
                onClick={() => setLabelDialogOpen(true)}
                type={Type.TERTIARY}
                size={Size.SMALL}
                tooltip="Manage labels"
              />
            </div>
            {userLabels.map((label) => (
              <button
                key={label.id}
                onClick={() => setActiveLabel(label.id)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 6,
                  background: activeLabel === label.id ? 'rgba(45, 184, 175, 0.1)' : 'transparent',
                  color: activeLabel === label.id ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-secondary)',
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

      {/* Custom Domains */}
      {!sidebarCollapsed && (
        <div style={{ padding: '4px 8px', borderTop: '1px solid var(--hsn-border-primary)' }}>
          <button
            onClick={() => {
              const { settingsView, setSettingsView } = useMailStore.getState();
              setSettingsView(settingsView === 'domains' ? 'mail' : 'domains');
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 6,
              background: useMailStore.getState().settingsView === 'domains' ? 'rgba(45, 184, 175, 0.1)' : 'transparent',
              color: useMailStore.getState().settingsView === 'domains' ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-secondary)',
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              transition: 'all 0.1s',
            }}
          >
            <Globe size={16} />
            Custom Domains
          </button>
        </div>
      )}

      {/* Footer */}
      {!sidebarCollapsed && (
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--hsn-border-primary)',
            fontSize: 11,
            color: 'var(--hsn-text-tertiary)',
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
