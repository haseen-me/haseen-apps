import { useMailStore } from '@/store/mail';
import { useDecrypt } from '@/hooks/useDecrypt';
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
} from 'lucide-react';

export function ThreadView() {
  const { activeThreadId, threads, setActiveThreadId, setComposeOpen, setReplyToThreadId } =
    useMailStore();

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

        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <ActionButton icon={<Archive size={16} />} label="Archive" />
          <ActionButton icon={<Trash2 size={16} />} label="Delete" />
          <ActionButton icon={<MoreHorizontal size={16} />} label="More" />
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

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      title={label}
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
