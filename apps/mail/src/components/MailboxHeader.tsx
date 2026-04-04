import {
  Archive,
  Check,
  CheckSquare,
  MoreHorizontal,
  RefreshCw,
  Square,
  Star,
  Trash2,
} from 'lucide-react';
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
  } = useMailStore();
  const toast = useToastStore();

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
