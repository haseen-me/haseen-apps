import {
  Archive,
  Check,
  CheckSquare,
  ArrowDownAZ,
  MailOpen,
  RefreshCw,
  Square,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { IconButton, Dropdown, DropdownItem, DropdownItemColor, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import { useMailStore } from '@/store/mail';
import { useToastStore } from '@haseen-me/shared/toast';
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
    sortBy,
    setSortBy,
  } = useMailStore();
  const toast = useToastStore();
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const labelAnchorRef = useRef<HTMLButtonElement>(null);
  const sortAnchorRef = useRef<HTMLButtonElement>(null);

  const labelName = SYSTEM_LABELS.find((l) => l.id === activeLabel)?.name ?? activeLabel;
  const filteredThreads = threads.filter((t) => t.labels.includes(activeLabel));
  const allSelected = filteredThreads.length > 0 && selectedIds.size === filteredThreads.length;
  const someSelected = selectedIds.size > 0;
  const selectedThreads = threads.filter((t) => selectedIds.has(t.id));

  const handleBulkArchive = async () => {
    try {
      await Promise.all(selectedThreads.flatMap((t) => t.messages.map((m) => mailApi.moveMessage(m.id, 'archive'))));
      setThreads(threads.filter((t) => !selectedIds.has(t.id)));
      clearSelection();
      toast.show(`${selectedIds.size} archived`);
    } catch { toast.show('Failed to archive'); }
  };

  const handleBulkStar = async () => {
    try {
      await Promise.all(selectedThreads.flatMap((t) => t.messages.map((m) => mailApi.updateMessage(m.id, { starred: true }))));
      setThreads(threads.map((t) => selectedIds.has(t.id) ? { ...t, messages: t.messages.map((m) => ({ ...m, starred: true })) } : t));
      clearSelection();
      toast.show(`${selectedIds.size} starred`);
    } catch { toast.show('Failed to star'); }
  };

  const handleBulkTrash = async () => {
    try {
      await Promise.all(selectedThreads.flatMap((t) => t.messages.map((m) => mailApi.moveMessage(m.id, 'trash'))));
      setThreads(threads.filter((t) => !selectedIds.has(t.id)));
      clearSelection();
      toast.show(`${selectedIds.size} moved to trash`);
    } catch { toast.show('Failed to move to trash'); }
  };

  const handleBulkMarkRead = async () => {
    try {
      await Promise.all(selectedThreads.flatMap((t) => t.messages.map((m) => mailApi.updateMessage(m.id, { read: true }))));
      setThreads(threads.map((t) => selectedIds.has(t.id) ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, read: true })) } : t));
      clearSelection();
      toast.show(`${selectedIds.size} marked as read`);
    } catch { toast.show('Failed to mark as read'); }
  };

  const handleBulkApplyLabel = async (labelId: string) => {
    setLabelMenuOpen(false);
    try {
      await Promise.all(selectedThreads.flatMap((t) => t.messages.map((m) => mailApi.moveMessage(m.id, labelId))));
      clearSelection();
      const lName = userLabels.find((l) => l.id === labelId)?.name ?? labelId;
      toast.show(`Moved ${selectedIds.size} to ${lName}`);
    } catch { toast.show('Failed to apply label'); }
  };

  const handleMarkAllRead = async () => {
    const unread = filteredThreads.filter((t) => t.unreadCount > 0);
    if (unread.length === 0) { toast.show('All messages already read'); return; }
    try {
      await Promise.all(unread.flatMap((t) => t.messages.filter((m) => !m.read).map((m) => mailApi.updateMessage(m.id, { read: true }))));
      setThreads(threads.map((t) => t.labels.includes(activeLabel) ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, read: true })) } : t));
      toast.show(`Marked ${unread.length} threads as read`);
    } catch { toast.show('Failed to mark all as read'); }
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
        height: 'var(--mail-header-height, 48px)',
        borderBottom: '1px solid var(--hsn-border-primary)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 4,
        flexShrink: 0,
        background: 'var(--hsn-bg-l1-solid)',
      }}
    >
      {/* Select all */}
      <IconButton
        icon={allSelected ? <CheckSquare size={18} /> : someSelected ? <CheckSquare size={18} /> : <Square size={18} />}
        onClick={() => (allSelected ? clearSelection() : selectAll())}
        type={someSelected ? Type.PRIMARY : Type.TERTIARY}
        size={Size.SMALL}
        tooltip={allSelected ? 'Deselect all' : 'Select all'}
      />

      {/* Label name */}
      <Typography size={TypographySize.LARGE} style={{ flex: 1, fontWeight: 600, whiteSpace: 'nowrap', paddingLeft: 8 }}>
        {labelName}
        <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--hsn-text-tertiary)', marginLeft: 8 }}>
          {filteredThreads.length} {filteredThreads.length === 1 ? 'thread' : 'threads'}
        </span>
      </Typography>

      {/* Bulk actions */}
      {someSelected && (
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton icon={<Archive size={16} />} type={Type.TERTIARY} size={Size.SMALL} tooltip="Archive" onClick={handleBulkArchive} />
          <IconButton icon={<Star size={16} />} type={Type.TERTIARY} size={Size.SMALL} tooltip="Star" onClick={handleBulkStar} />
          <IconButton icon={<Trash2 size={16} />} type={Type.TERTIARY} size={Size.SMALL} tooltip="Delete" onClick={handleBulkTrash} />
          <IconButton icon={<MailOpen size={16} />} type={Type.TERTIARY} size={Size.SMALL} tooltip="Mark read" onClick={handleBulkMarkRead} />
          {userLabels.length > 0 && (
            <div style={{ position: 'relative' }}>
              <IconButton
                ref={labelAnchorRef}
                icon={<Tag size={16} />}
                type={Type.TERTIARY}
                size={Size.SMALL}
                tooltip="Move to label"
                onClick={() => setLabelMenuOpen(!labelMenuOpen)}
              />
              <Dropdown open={labelMenuOpen} onClose={() => setLabelMenuOpen(false)} anchor={labelAnchorRef} width={180}>
                {userLabels.map((label) => (
                  <DropdownItem
                    key={label.id}
                    label={label.name}
                    icon={<span style={{ width: 10, height: 10, borderRadius: '50%', background: label.color, display: 'inline-block' }} />}
                    onClick={() => handleBulkApplyLabel(label.id)}
                  />
                ))}
              </Dropdown>
            </div>
          )}
        </div>
      )}

      {/* Sort */}
      <div style={{ position: 'relative' }}>
        <button
          ref={sortAnchorRef}
          onClick={() => setSortMenuOpen(!sortMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--hsn-text-tertiary)',
            padding: '4px 8px',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          <ArrowDownAZ size={14} />
          {sortBy === 'date' ? 'Date' : sortBy === 'sender' ? 'Sender' : 'Subject'}
        </button>
        <Dropdown open={sortMenuOpen} onClose={() => setSortMenuOpen(false)} anchor={sortAnchorRef} width={140}>
          {(['date', 'sender', 'subject'] as const).map((opt) => (
            <DropdownItem
              key={opt}
              label={opt.charAt(0).toUpperCase() + opt.slice(1)}
              active={sortBy === opt}
              endElement={sortBy === opt ? <Check size={12} /> : undefined}
              onClick={() => { setSortBy(opt); setSortMenuOpen(false); }}
            />
          ))}
        </Dropdown>
      </div>

      <IconButton icon={<MailOpen size={14} />} type={Type.TERTIARY} size={Size.SMALL} tooltip="Mark all as read" onClick={handleMarkAllRead} />
      <IconButton
        icon={<RefreshCw size={16} style={{ animation: loading ? 'spin 0.8s linear infinite' : undefined }} />}
        type={Type.TERTIARY}
        size={Size.SMALL}
        tooltip="Refresh"
        onClick={handleRefresh}
      />
    </div>
  );
}
