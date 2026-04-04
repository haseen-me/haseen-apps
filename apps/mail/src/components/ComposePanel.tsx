import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { sealEnvelope } from '@haseen-me/crypto';
import { mailApi, keysApi } from '@/api/client';
import type { ComposeMessage, EmailAddress } from '@/types/mail';
import { X, Minus, Maximize2, Send, Paperclip, Lock, LockOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { RecipientInput } from './RecipientInput';

interface Recipient {
  address: string;
  name?: string;
}

export function ComposePanel() {
  const { composeOpen, setComposeOpen, replyToThreadId, setReplyToThreadId, threads } =
    useMailStore();
  const toast = useToastStore();

  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState<Recipient[]>([]);
  const [cc, setCc] = useState<Recipient[]>([]);
  const [bcc, setBcc] = useState<Recipient[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [encrypted, setEncrypted] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { initializeKeys, encryptionKeyPair, signingKeyPair, initialized } = useCryptoStore();

  // Auto-fill reply info
  useEffect(() => {
    if (replyToThreadId) {
      const thread = threads.find((t) => t.id === replyToThreadId);
      if (thread) {
        const lastMsg = thread.messages[thread.messages.length - 1];
        setTo([{ address: lastMsg.from.address }]);
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
    setTo([]);
    setCc([]);
    setBcc([]);
    setSubject('');
    setBody('');
    setAttachments([]);
    setShowCcBcc(false);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const recipientAddrs = to.map((r) => ({ address: r.address }));
      const ccAddrs = cc.map((r) => ({ address: r.address }));
      const bccAddrs = bcc.map((r) => ({ address: r.address }));

      if (encrypted && encryptionKeyPair && signingKeyPair) {
        // Look up recipient public keys from keyserver
        const allEmails = [...recipientAddrs, ...ccAddrs, ...bccAddrs].map((a) => a.address);
        const recipientPubKeys: Uint8Array[] = [encryptionKeyPair.publicKey]; // always encrypt to self
        try {
          const result = await keysApi.lookupKeys(allEmails);
          for (const uid of Object.keys(result.keys)) {
            const bundle = result.keys[uid];
            if (bundle?.encryptionPublicKey) {
              // Backend returns base64-encoded []byte
              const bytes = Uint8Array.from(atob(bundle.encryptionPublicKey), (c) => c.charCodeAt(0));
              recipientPubKeys.push(bytes);
            }
          }
        } catch {
          // Keyserver unavailable — encrypt to self only
        }

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

        const result = await mailApi.sendMessage({
          to: recipientAddrs,
          cc: ccAddrs,
          bcc: bccAddrs,
          subject: subject || '(no subject)',
          bodyHtml: body || '',
          encryptedSubject: JSON.stringify(subjectEnvelope),
          encryptedBody: JSON.stringify(bodyEnvelope),
          encryptedSessionKeys: sessionKeys,
        });

        // Upload attachments after message is created
        if (attachments.length > 0 && result.id) {
          await Promise.all(attachments.map((f) => mailApi.uploadAttachment(result.id, f).catch(() => {})));
        }
      } else {
        // Unencrypted fallback
        const result = await mailApi.sendMessage({
          to: recipientAddrs,
          cc: ccAddrs,
          bcc: bccAddrs,
          subject: subject || '(no subject)',
          bodyHtml: body || '',
        });

        if (attachments.length > 0 && result.id) {
          await Promise.all(attachments.map((f) => mailApi.uploadAttachment(result.id, f).catch(() => {})));
        }
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
        <RecipientInput
          label="To"
          recipients={to}
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
            <RecipientInput label="Cc" recipients={cc} onChange={setCc} />
            <RecipientInput label="Bcc" recipients={bcc} onChange={setBcc} />
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

      {/* Attachment chips */}
      {attachments.length > 0 && (
        <div style={{ padding: '4px 16px 0', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {attachments.map((f, i) => (
            <span
              key={i}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                borderRadius: 12,
                background: 'var(--mail-bg-active)',
                fontSize: 12,
                color: 'var(--mail-text-muted)',
              }}
            >
              <Paperclip size={11} />
              {f.name}
              <button
                onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--mail-text-muted)', display: 'flex' }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

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
          disabled={sending || to.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 20px',
            borderRadius: 'var(--mail-radius)',
            background: sending || to.length === 0 ? 'var(--mail-text-muted)' : 'var(--mail-brand)',
            color: '#fff',
            border: 'none',
            fontWeight: 600,
            fontSize: 14,
            cursor: sending || to.length === 0 ? 'default' : 'pointer',
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
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) {
                setAttachments((prev) => [...prev, ...Array.from(e.target.files!)]);
                e.target.value = '';
              }
            }}
          />
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
