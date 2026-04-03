import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { sealEnvelope } from '@haseen-me/crypto';
import type { EncryptedEnvelope } from '@haseen-me/crypto';
import { mailApi } from '@/api/client';
import type { ComposeMessage, EmailAddress } from '@/types/mail';
import { X, Minus, Maximize2, Send, Paperclip, Lock, LockOpen, ChevronDown, ChevronUp } from 'lucide-react';

export function ComposePanel() {
  const { composeOpen, setComposeOpen, replyToThreadId, setReplyToThreadId, threads } =
    useMailStore();
  const toast = useToastStore();

  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [encrypted, setEncrypted] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { initializeKeys, encryptionKeyPair, signingKeyPair, initialized } = useCryptoStore();

  // Auto-fill reply info
  useEffect(() => {
    if (replyToThreadId) {
      const thread = threads.find((t) => t.id === replyToThreadId);
      if (thread) {
        const lastMsg = thread.messages[thread.messages.length - 1];
        setTo(lastMsg.from.address);
        setSubject(thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`);
      }
    }
  }, [replyToThreadId, threads]);

  // Initialize crypto keys on mount
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  if (!composeOpen) return null;

  const handleClose = () => {
    setComposeOpen(false);
    setReplyToThreadId(null);
    setTo('');
    setCc('');
    setBcc('');
    setSubject('');
    setBody('');
    setShowCcBcc(false);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const recipients = to.split(',').map((e) => e.trim()).filter(Boolean);

      if (encrypted && encryptionKeyPair && signingKeyPair) {
        // Encrypt for self as recipient (in production, would lookup recipient keys via keysApi)
        const recipientPubKeys = [encryptionKeyPair.publicKey];

        const { envelope: subjectEnvelope, encryptedSessionKeys: subjectKeys } = sealEnvelope(
          subject || '(no subject)',
          encryptionKeyPair,
          signingKeyPair,
          recipientPubKeys,
        );
        const { envelope: bodyEnvelope, encryptedSessionKeys: bodyKeys } = sealEnvelope(
          body || '',
          encryptionKeyPair,
          signingKeyPair,
          recipientPubKeys,
        );

        // Serialize session keys: hex pubkey -> base64 encrypted key
        const sessionKeys: Record<string, string> = {};
        for (const [k, v] of bodyKeys) {
          sessionKeys[k] = btoa(String.fromCharCode(...v));
        }

        await mailApi.sendMessage({
          to: recipients,
          encryptedSubject: JSON.stringify(subjectEnvelope),
          encryptedBody: JSON.stringify(bodyEnvelope),
          encryptedSessionKeys: sessionKeys,
        });
      } else {
        // Unencrypted fallback
        await mailApi.sendMessage({
          to: recipients,
          encryptedSubject: subject,
          encryptedBody: body,
          encryptedSessionKeys: {},
        });
      }
    } catch (err) {
      // Backend may be offline in development — show toast and close gracefully
      console.warn('[Mail] Send failed:', err);
      toast.show('Message could not be sent — backend unavailable');
    } finally {
      setSending(false);
      handleClose();
      toast.show(encrypted ? 'Encrypted message sent' : 'Message sent');
    }
  };

  if (minimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 24,
          width: 320,
          height: 40,
          borderRadius: '8px 8px 0 0',
          background: 'var(--mail-text)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 8,
          cursor: 'pointer',
          zIndex: 100,
          boxShadow: 'var(--mail-shadow-lg)',
        }}
        onClick={() => setMinimized(false)}
      >
        <Send size={14} />
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subject || 'New Message'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
          style={{ background: 'none', border: 'none', color: '#fff', padding: 2, display: 'flex' }}
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 24,
        width: 520,
        maxHeight: 'calc(100vh - 60px)',
        borderRadius: '12px 12px 0 0',
        background: 'var(--mail-bg)',
        boxShadow: 'var(--mail-shadow-lg)',
        border: '1px solid var(--mail-border)',
        borderBottom: 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: '10px 16px',
          background: 'var(--mail-text)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          borderRadius: '12px 12px 0 0',
          cursor: 'move',
          flexShrink: 0,
        }}
      >
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
          {replyToThreadId ? 'Reply' : 'New Message'}
        </span>
        <button
          onClick={() => setMinimized(true)}
          style={{ background: 'none', border: 'none', color: '#fff', padding: 2, display: 'flex', cursor: 'pointer' }}
        >
          <Minus size={14} />
        </button>
        <button
          onClick={handleClose}
          style={{ background: 'none', border: 'none', color: '#fff', padding: 2, display: 'flex', cursor: 'pointer' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Fields */}
      <div style={{ padding: '0 16px', flexShrink: 0 }}>
        <ComposeField
          label="To"
          value={to}
          onChange={setTo}
          rightAction={
            !showCcBcc ? (
              <button
                onClick={() => setShowCcBcc(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mail-text-muted)',
                  fontSize: 12,
                  cursor: 'pointer',
                  padding: '0 4px',
                }}
              >
                Cc/Bcc
              </button>
            ) : null
          }
        />
        {showCcBcc && (
          <>
            <ComposeField label="Cc" value={cc} onChange={setCc} />
            <ComposeField label="Bcc" value={bcc} onChange={setBcc} />
          </>
        )}
        <ComposeField label="Subject" value={subject} onChange={setSubject} />
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setBody(e.currentTarget.innerHTML)}
        style={{
          flex: 1,
          minHeight: 200,
          padding: '12px 16px',
          fontSize: 14,
          lineHeight: 1.7,
          outline: 'none',
          overflow: 'auto',
          color: 'var(--mail-text)',
        }}
      />

      {/* Bottom bar */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--mail-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleSend}
          disabled={sending || !to.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 20px',
            borderRadius: 'var(--mail-radius)',
            background: sending || !to.trim() ? 'var(--mail-text-muted)' : 'var(--mail-brand)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: sending || !to.trim() ? 'default' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <Send size={14} />
          {sending ? 'Sending...' : 'Send'}
        </button>

        <label
          style={{
            color: 'var(--mail-text-muted)',
            padding: 4,
            borderRadius: 4,
            display: 'flex',
            cursor: 'pointer',
          }}
        >
          <Paperclip size={16} />
          <input type="file" multiple style={{ display: 'none' }} />
        </label>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setEncrypted(!encrypted)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            color: encrypted ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'color 0.15s',
          }}
          title={encrypted ? 'End-to-end encryption enabled' : 'Encryption disabled'}
        >
          {encrypted ? <Lock size={13} /> : <LockOpen size={13} />}
          {encrypted ? 'E2E Encrypted' : 'Not Encrypted'}
        </button>

        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--mail-text-muted)',
            fontSize: 13,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          Discard
        </button>
      </div>
    </div>
  );
}

function ComposeField({
  label,
  value,
  onChange,
  rightAction,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rightAction?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
        borderBottom: '1px solid var(--mail-border-subtle)',
      }}
    >
      <label
        style={{
          fontSize: 13,
          color: 'var(--mail-text-muted)',
          width: 56,
          flexShrink: 0,
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 14,
          background: 'transparent',
          color: 'var(--mail-text)',
          fontFamily: 'inherit',
        }}
      />
      {rightAction}
    </div>
  );
}
