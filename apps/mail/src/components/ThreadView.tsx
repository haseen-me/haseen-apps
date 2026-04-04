import { useState } from 'react';
import { useMailStore } from '@/store/mail';
import { useDecrypt } from '@/hooks/useDecrypt';
import { useToastStore } from '@/store/toast';
import { mailApi } from '@/api/client';
import { MessageItem } from './MessageItem';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Lock,
  Mail,
  MailOpen,
  Star,
} from 'lucide-react';

export function ThreadView() {
  const { activeThreadId, threads, setActiveThreadId, setComposeOpen, setReplyToThreadId, setThreads } =
    useMailStore();
  const toast = useToastStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const thread = threads.find((t) => t.id === activeThreadId);
  const decryptedSubject = useDecrypt(thread?.subject ?? '');

  if (!activeThreadId || !thread) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--mail-text-muted)',
          gap: 12,
        }}
      >
        <Mail size={48} style={{ opacity: 0.3 }} />
        <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--mail-text-secondary)' }}>
          Select a conversation
        </div>
        <div style={{ fontSize: 13 }}>Choose a thread from the left to read</div>
      </div>
    );
  }

  const handleReply = () => {
    setReplyToThreadId(thread.id);
    setComposeOpen(true);
  };

  const handleArchive = async () => {
    try {
      await Promise.all(thread.messages.map((m) => mailApi.moveMessage(m.id, 'archive')));
      setThreads(threads.filter((t) => t.id !== thread.id));
      setActiveThreadId(null);
      toast.show('Conversation archived');
    } catch {
      toast.show('Failed to archive');
    }
  };

  const handleTrash = async () => {
    try {
      await Promise.all(thread.messages.map((m) => mailApi.moveMessage(m.id, 'trash')));
      setThreads(threads.filter((t) => t.id !== thread.id));
      setActiveThreadId(null);
      toast.show('Moved to trash');
    } catch {
      toast.show('Failed to move to trash');
    }
  };

  const handleToggleRead = async () => {
    const allRead = thread.messages.every((m) => m.read);
    const newRead = !allRead;
    try {
      await Promise.all(thread.messages.map((m) => mailApi.updateMessage(m.id, { read: newRead })));
      setThreads(
        threads.map((t) =>
          t.id === thread.id
            ? {
                ...t,
                unreadCount: newRead ? 0 : t.messages.length,
                messages: t.messages.map((m) => ({ ...m, read: newRead })),
              }
            : t,
        ),
      );
      toast.show(newRead ? 'Marked as read' : 'Marked as unread');
    } catch {
      toast.show('Failed to update');
    }
  };

  const handleToggleStar = async () => {
    const allStarred = thread.messages.every((m) => m.starred);
    const newStarred = !allStarred;
    try {
      await Promise.all(thread.messages.map((m) => mailApi.updateMessage(m.id, { starred: newStarred })));
      setThreads(
        threads.map((t) =>
          t.id === thread.id
            ? { ...t, messages: t.messages.map((m) => ({ ...m, starred: newStarred })) }
            : t,
        ),
      );
      toast.show(newStarred ? 'Starred' : 'Unstarred');
    } catch {
      toast.show('Failed to update');
    }
  };

  const allRead = thread.messages.every((m) => m.read);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Thread header */}
      <div
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--mail-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveThreadId(null)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mail-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            cursor: 'pointer',
          }}
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}
          >
            {decryptedSubject}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--mail-text-muted)', marginTop: 2 }}>
            {thread.messages.length} message{thread.messages.length > 1 ? 's' : ''} ·{' '}
            {thread.messages.some((m) => m.encrypted) && (
              <span style={{ color: 'var(--mail-brand)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <Lock size={11} /> Encrypted
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2, flexShrink: 0, position: 'relative' }}>
          <ActionButton icon={<Archive size={16} />} label="Archive" onClick={handleArchive} />
          <ActionButton icon={<Trash2 size={16} />} label="Delete" onClick={handleTrash} />
          <ActionButton
            icon={<MoreHorizontal size={16} />}
            label="More"
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
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
              <MenuButton
                icon={allRead ? <MailOpen size={15} /> : <Mail size={15} />}
                label={allRead ? 'Mark as unread' : 'Mark as read'}
                onClick={() => {
                  setMenuOpen(false);
                  handleToggleRead();
                }}
              />
              <MenuButton
                icon={<Star size={15} />}
                label={thread.messages.every((m) => m.starred) ? 'Unstar' : 'Star'}
                onClick={() => {
                  setMenuOpen(false);
                  handleToggleStar();
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          background: 'var(--mail-bg-secondary)',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {thread.messages.map((msg, i) => (
            <MessageItem key={msg.id} message={msg} isLast={i === thread.messages.length - 1} />
          ))}
        </div>
      </div>

      {/* Reply bar */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--mail-border)',
          display: 'flex',
          gap: 8,
          flexShrink: 0,
          background: 'var(--mail-bg)',
        }}
      >
        <button
          onClick={handleReply}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 'var(--mail-radius)',
            background: 'var(--mail-brand)',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <Reply size={15} /> Reply
        </button>
        <button
          onClick={() => {
            setReplyToThreadId(thread.id);
            setComposeOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 'var(--mail-radius)',
            background: 'var(--mail-bg-secondary)',
            color: 'var(--mail-text-secondary)',
            border: '1px solid var(--mail-border)',
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          <Forward size={15} /> Forward
        </button>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
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
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
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
      {icon}
      {label}
    </button>
  );
}
