import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useMailStore } from '@/store/mail';
import { useToastStore } from '@haseen-me/shared/toast';
import { mailApi } from '@/api/client';
import type { Thread } from '@/types/mail';

interface Props {
  thread: Thread;
  onClose: () => void;
}

export function InlineReply({ thread, onClose }: Props) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToastStore();
  const { threads, setThreads } = useMailStore();

  const lastMsg = thread.messages[thread.messages.length - 1];
  const replyTo = lastMsg?.from;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const result = await mailApi.sendMessage({
        to: replyTo ? [replyTo] : [],
        subject: `Re: ${thread.subject}`,
        bodyHtml: `<p>${body.replace(/\n/g, '<br>')}</p>`,
        replyToMessageId: lastMsg?.id,
      });
      // Optimistic: add the reply to the thread
      setThreads(
        threads.map((t) =>
          t.id === thread.id
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: result.id,
                    threadId: thread.id,
                    from: { name: 'Me', address: '' },
                    to: replyTo ? [replyTo] : [],
                    cc: [],
                    bcc: [],
                    subject: `Re: ${thread.subject}`,
                    bodyHtml: `<p>${body.replace(/\n/g, '<br>')}</p>`,
                    bodyText: body,
                    date: new Date().toISOString(),
                    read: true,
                    starred: false,
                    labels: thread.labels,
                    attachments: [],
                    encrypted: false,
                  },
                ],
                lastMessageDate: new Date().toISOString(),
              }
            : t,
        ),
      );
      toast.show('Reply sent');
      onClose();
    } catch {
      toast.show('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        margin: '12px 20px 20px',
        border: '1px solid var(--hsn-border-primary)',
        borderRadius: '8px',
        background: 'var(--hsn-bg-l1-solid)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 12px',
          fontSize: 12,
          color: 'var(--hsn-text-tertiary)',
          borderBottom: '1px solid var(--hsn-border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>
          Reply to {replyTo?.name || replyTo?.address || 'sender'}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--hsn-text-tertiary)',
            padding: 2,
            display: 'flex',
          }}
        >
          <X size={14} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply..."
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSend();
          }
        }}
        style={{
          width: '100%',
          minHeight: 100,
          padding: '10px 12px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontSize: 14,
          lineHeight: '1.5',
          fontFamily: 'inherit',
          background: 'transparent',
          color: 'var(--hsn-text-primary)',
          boxSizing: 'border-box',
        }}
      />
      <div
        style={{
          padding: '8px 12px',
          borderTop: '1px solid var(--hsn-border-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 11, color: 'var(--hsn-text-tertiary)' }}>
          ⌘ Enter to send
        </span>
        <button
          onClick={handleSend}
          disabled={sending || !body.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: '8px',
            background: sending || !body.trim() ? 'var(--hsn-bg-l0-solid)' : 'var(--hsn-accent-teal)',
            color: sending || !body.trim() ? 'var(--hsn-text-tertiary)' : '#fff',
            border: 'none',
            fontWeight: 500,
            fontSize: 13,
            cursor: sending || !body.trim() ? 'default' : 'pointer',
          }}
        >
          <Send size={14} /> {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
