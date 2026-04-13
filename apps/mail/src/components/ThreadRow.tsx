import { Paperclip, Star } from 'lucide-react';
import { useMailStore } from '@/store/mail';
import { useDecrypt } from '@/hooks/useDecrypt';
import type { Thread } from '@/types/mail';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;

  if (diffH < 1) {
    const m = Math.floor(diffMs / 60000);
    return m <= 0 ? 'now' : `${m}m`;
  }
  if (diffH < 24 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffH < 168) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function avatar(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return name[0];
}

export function ThreadRow({ thread }: { thread: Thread }) {
  const { activeThreadId, setActiveThreadId, selectedIds, toggleSelected } = useMailStore();
  const isActive = activeThreadId === thread.id;
  const isSelected = selectedIds.has(thread.id);
  const isUnread = thread.unreadCount > 0;
  const from = thread.from;
  const decryptedSubject = useDecrypt(thread.subject);
  const decryptedSnippet = useDecrypt(thread.snippet);

  return (
    <div
      onClick={() => setActiveThreadId(thread.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 16px',
        borderBottom: '1px solid var(--hsn-border-primary)',
        background: isActive
          ? 'rgba(45,184,175,0.08)'
          : isSelected
          ? 'var(--hsn-bg-cell)'
          : isUnread
          ? 'rgba(45,184,175,0.04)'
          : 'var(--hsn-bg-l1-solid)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isSelected) e.currentTarget.style.background = 'var(--hsn-bg-cell)';
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isSelected) e.currentTarget.style.background = isUnread ? 'rgba(45,184,175,0.04)' : 'var(--hsn-bg-l1-solid)';
      }}
    >
      {/* Checkbox / Avatar */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          toggleSelected(thread.id);
        }}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: isSelected ? 'var(--hsn-accent-teal)' : stringToColor(from.name || from.address),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {isSelected ? '✓' : avatar(from.name || from.address)}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontWeight: isUnread ? 600 : 400,
              fontSize: 14,
              color: 'var(--hsn-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flex: 1,
            }}
          >
            {from.name || from.address}
            {thread.messages.length > 1 && (
              <span style={{ color: 'var(--hsn-text-tertiary)', fontWeight: 400, fontSize: 12, marginLeft: 4 }}>
                ({thread.messages.length})
              </span>
            )}
          </span>
          <span
            style={{
              fontSize: 12,
              color: isUnread ? 'var(--hsn-accent-teal)' : 'var(--hsn-text-tertiary)',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatDate(thread.lastMessageDate)}
          </span>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: isUnread ? 600 : 400,
            color: 'var(--hsn-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 1,
          }}
        >
          {decryptedSubject}
        </div>

        <div
          style={{
            fontSize: 13,
            color: 'var(--hsn-text-tertiary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: 1,
          }}
        >
          {decryptedSnippet}
        </div>
      </div>

      {/* Right indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {thread.hasAttachments && <Paperclip size={14} style={{ color: 'var(--hsn-text-tertiary)' }} />}
        {thread.messages[0]?.starred && (
          <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
        )}
        {isUnread && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--hsn-accent-teal)',
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  );
}

function stringToColor(str: string): string {
  const colors = [
    '#e5484d', '#e54666', '#d6409f', '#8e4ec6', '#6e56cf',
    '#3e63dd', '#0091ff', '#00a2c7', '#2db8af', '#30a46c',
    '#46a758', '#a18072', '#978365', '#f76b15',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
