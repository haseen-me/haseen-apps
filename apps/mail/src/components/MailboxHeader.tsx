import {
  Archive,
  Check,
  CheckSquare,
  MailOpen,
  MoreHorizontal,
  RefreshCw,
  Square,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { useToastStore } from '@/store/toast';
import { mailApi } from '@/api/client';
import { SYSTEM_LABELS } from '@/types/mail';

export function MailboxHeader() {
  const {
    activeLabel,
    threads,
    selectedIds,
    selectAll,
    clearSelection,
    loading,
    setLoading,
    setThreads,
    userLabels,
  } = useMailStore();
  const toast = useToastStore();
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const labelRef = useRef<HTMLDivElement>(null);

  const labelName =
    SYSTEM_LABELS.find((l) => l.id === activeLabel)?.name ?? activeLabel;

  const filteredThreads = threads.filter((t) => t.labels.includes(activeLabel));
  const allSelected = filteredThreads.length > 0 && selectedIds.size === filteredThreads.length;
  const someSelected = selectedIds.size > 0;

  const selectedThreads = threads.filter((t) => selectedIds.has(t.id));

  const handleBulkArchive = async () => {
    try {
      const moves = selectedThreads.flatMap((t) =>
        t.messages.map((m) => mailApi.moveMessage(m.id, 'archive')),
      );
      await Promise.all(moves);
      setThreads(threads.filter((t) => !selectedIds.has(t.id)));
      clearSelection();
      toast.show(`${selectedIds.size} archived`);
    } catch {
      toast.show('Failed to archive');
    }
  };

  const handleBulkStar = async () => {
    try {
      const updates = selectedThreads.flatMap((t) =>
        t.messages.map((m) => mailApi.updateMessage(m.id, { starred: true })),
      );
      await Promise.all(updates);
      setThreads(
        threads.map((t) =>
          selectedIds.has(t.id)
            ? { ...t, messages: t.messages.map((m) => ({ ...m, starred: true })) }
            : t,
        ),
      );
      clearSelection();
      toast.show(`${selectedIds.size} starred`);
    } catch {
      toast.show('Failed to star');
    }
  };

  const handleBulkTrash = async () => {
    try {
      const moves = selectedThreads.flatMap((t) =>
        t.messages.map((m) => mailApi.moveMessage(m.id, 'trash')),
      );
      await Promise.all(moves);
      setThreads(threads.filter((t) => !selectedIds.has(t.id)));
      clearSelection();
      toast.show(`${selectedIds.size} moved to trash`);
    } catch {
      toast.show('Failed to move to trash');
    }
  };

  const handleBulkMarkRead = async () => {
    try {
      const updates = selectedThreads.flatMap((t) =>
        t.messages.map((m) => mailApi.updateMessage(m.id, { read: true })),
      );
      await Promise.all(updates);
      setThreads(
        threads.map((t) =>
          selectedIds.has(t.id)
            ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, read: true })) }
            : t,
        ),
      );
      clearSelection();
      toast.show(`${selectedIds.size} marked as read`);
    } catch {
      toast.show('Failed to mark as read');
    }
  };

  const handleBulkApplyLabel = async (labelId: string) => {
    setLabelMenuOpen(false);
    try {
      const moves = selectedThreads.flatMap((t) =>
        t.messages.map((m) => mailApi.moveMessage(m.id, labelId)),
      );
      await Promise.all(moves);
      clearSelection();
      const labelName = userLabels.find((l) => l.id === labelId)?.name ?? labelId;
      toast.show(`Moved ${selectedIds.size} to ${labelName}`);
    } catch {
      toast.show('Failed to apply label');
    }
  };

  // Close label menu on outside click
  useEffect(() => {
    if (!labelMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (labelRef.current && !labelRef.current.contains(e.target as Node)) {
        setLabelMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [labelMenuOpen]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await mailApi.getMailbox(activeLabel);
      setThreads(data.threads);
    } catch {
      // keep current data
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: 'var(--mail-header-height)',
        borderBottom: '1px solid var(--mail-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 8,
        flexShrink: 0,
        background: 'var(--mail-bg)',
      }}
    >
      {/* Select all */}
      <button
        onClick={() => (allSelected ? clearSelection() : selectAll())}
        style={{
          background: 'none',
          border: 'none',
          color: someSelected ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
          padding: 4,
          borderRadius: 4,
          display: 'flex',
        }}
        title={allSelected ? 'Deselect all' : 'Select all'}
      >
        {allSelected ? <CheckSquare size={18} /> : someSelected ? <CheckSquare size={18} /> : <Square size={18} />}
      </button>

      {/* Label name */}
      <h1
        style={{
          fontSize: 16,
          fontWeight: 600,
          flex: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {labelName}
        <span
          style={{
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--mail-text-muted)',
            marginLeft: 8,
          }}
        >
          {filteredThreads.length} {filteredThreads.length === 1 ? 'thread' : 'threads'}
        </span>
      </h1>

      {/* Bulk actions (show when selected) */}
      {someSelected && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <HeaderButton icon={<Archive size={16} />} label="Archive" onClick={handleBulkArchive} />
          <HeaderButton icon={<Star size={16} />} label="Star" onClick={handleBulkStar} />
          <HeaderButton icon={<Trash2 size={16} />} label="Delete" onClick={handleBulkTrash} />
          <HeaderButton icon={<MailOpen size={16} />} label="Mark read" onClick={handleBulkMarkRead} />
          {userLabels.length > 0 && (
            <div ref={labelRef} style={{ position: 'relative' }}>
              <HeaderButton icon={<Tag size={16} />} label="Move to label" onClick={() => setLabelMenuOpen(!labelMenuOpen)} />
              {labelMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    background: 'var(--mail-bg)',
                    border: '1px solid var(--mail-border)',
                    borderRadius: 'var(--mail-radius)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    zIndex: 100,
                    minWidth: 160,
                    overflow: 'hidden',
                  }}
                >
                  {userLabels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => handleBulkApplyLabel(label.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 12px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--mail-text)',
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mail-bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
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
            </div>
          )}
        </div>
      )}

      {/* Refresh */}
      <button
        onClick={handleRefresh}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--mail-text-muted)',
          padding: 4,
          borderRadius: 4,
          display: 'flex',
          cursor: 'pointer',
        }}
        title="Refresh"
      >
        <RefreshCw
          size={16}
          style={{
            animation: loading ? 'spin 0.8s linear infinite' : undefined,
          }}
        />
      </button>
    </div>
  );
}

function HeaderButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--mail-text-muted)',
        padding: '5px 8px',
        borderRadius: 'var(--mail-radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}
