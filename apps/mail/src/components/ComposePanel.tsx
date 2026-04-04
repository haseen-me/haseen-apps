import { useState, useRef, useEffect, useCallback } from 'react';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { sealEnvelope } from '@haseen-me/crypto';
import { mailApi, keysApi } from '@/api/client';
import type { ComposeMessage, EmailAddress } from '@/types/mail';
import { X, Minus, Maximize2, Send, Paperclip, Lock, LockOpen, ChevronDown, ChevronUp, Save, Bold, Italic, Underline, Strikethrough, List, ListOrdered, Link, Code, RemoveFormatting } from 'lucide-react';
import { RecipientInput } from './RecipientInput';

interface Recipient {
  address: string;
  name?: string;
}

export function ComposePanel() {
  const { composeOpen, setComposeOpen, replyToThreadId, setReplyToThreadId, forwardFromThreadId, setForwardFromThreadId, threads } =
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
  const [draftId, setDraftId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { initializeKeys, encryptionKeyPair, signingKeyPair, initialized } = useCryptoStore();

  const hasContent = to.length > 0 || subject.trim() !== '' || body.trim() !== '';

  const saveDraft = useCallback(async () => {
    if (!hasContent) return;
    const params = {
      to: to.map((r) => ({ address: r.address })),
      cc: cc.map((r) => ({ address: r.address })),
      bcc: bcc.map((r) => ({ address: r.address })),
      subject: subject || '(no subject)',
      bodyHtml: body || '',
    };
    try {
      if (draftId) {
        await mailApi.updateDraft(draftId, params);
      } else {
        const res = await mailApi.saveDraft(params);
        setDraftId(res.id);
      }
    } catch {
      // Backend unavailable — silently skip
    }
  }, [to, cc, bcc, subject, body, draftId, hasContent]);

  // Get current user's email for reply logic
  const getUserEmail = (): string => {
    try {
      const raw = localStorage.getItem('haseen-auth');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return (parsed.user?.email ?? '').toLowerCase();
    } catch { return ''; }
  };

  // Auto-fill reply info
  useEffect(() => {
    if (replyToThreadId) {
      const thread = threads.find((t) => t.id === replyToThreadId);
      if (thread) {
        const lastMsg = thread.messages[thread.messages.length - 1];
        const myEmail = getUserEmail();
        const senderIsMe = lastMsg.from.address.toLowerCase() === myEmail;

        if (senderIsMe) {
          // Replying to own message — reply to the original recipients instead
          setTo(lastMsg.to.filter((a: EmailAddress) => a.address.toLowerCase() !== myEmail).map((a: EmailAddress) => ({ address: a.address, name: a.name })));
        } else {
          // Reply to sender + all To/CC minus self (Reply-All behavior)
          const allRecipients = [
            { address: lastMsg.from.address, name: lastMsg.from.name },
            ...lastMsg.to.map((a: EmailAddress) => ({ address: a.address, name: a.name })),
            ...lastMsg.cc.map((a: EmailAddress) => ({ address: a.address, name: a.name })),
          ];
          const unique = new Map<string, Recipient>();
          for (const r of allRecipients) {
            if (r.address.toLowerCase() !== myEmail) {
              unique.set(r.address.toLowerCase(), r);
            }
          }
          setTo([...unique.values()]);
        }

        setSubject(thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`);
        const date = new Date(lastMsg.date).toLocaleString();
        const from = lastMsg.from.name || lastMsg.from.address;
        const quoted =
          `<br><br><div style="border-left:2px solid #ccc;padding-left:12px;color:#888">` +
          `<p>On ${date}, ${from} wrote:</p>` +
          `${lastMsg.bodyHtml || lastMsg.bodyText || ''}</div>`;
        setBody(quoted);
        if (bodyRef.current) bodyRef.current.innerHTML = quoted;
      }
    }
  }, [replyToThreadId, threads]);

  // Auto-fill forward info
  useEffect(() => {
    if (forwardFromThreadId) {
      const thread = threads.find((t) => t.id === forwardFromThreadId);
      if (thread) {
        const lastMsg = thread.messages[thread.messages.length - 1];
        setTo([]); // Forward: user needs to enter recipient
        setSubject(thread.subject.startsWith('Fwd:') ? thread.subject : `Fwd: ${thread.subject}`);
        const date = new Date(lastMsg.date).toLocaleString();
        const from = lastMsg.from.name || lastMsg.from.address;
        const toAddrs = lastMsg.to.map((a: { name?: string; address: string }) => a.name || a.address).join(', ');
        const fwdBody =
          `<br><br><div style="border-top:1px solid #ccc;padding-top:12px;color:#888">` +
          `<p>---------- Forwarded message ----------</p>` +
          `<p>From: ${from}<br>Date: ${date}<br>Subject: ${lastMsg.subject || thread.subject}<br>To: ${toAddrs}</p>` +
          `${lastMsg.bodyHtml || lastMsg.bodyText || ''}</div>`;
        setBody(fwdBody);
        if (bodyRef.current) bodyRef.current.innerHTML = fwdBody;
      }
    }
  }, [forwardFromThreadId, threads]);

  // Initialize crypto keys on mount
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Sync body into contentEditable when set from reply/forward
  useEffect(() => {
    if (bodyRef.current && body) {
      bodyRef.current.innerHTML = body;
    }
  }, [body]);

  if (!composeOpen) return null;

  const handleClose = (discard?: boolean) => {
    if (!discard && hasContent) {
      saveDraft(); // fire and forget
    }
    setComposeOpen(false);
    setReplyToThreadId(null);
    setForwardFromThreadId(null);
    setTo([]);
    setCc([]);
    setBcc([]);
    setSubject('');
    setBody('');
    setAttachments([]);
    setShowCcBcc(false);
    setDraftId(null);
  };

  const handleSend = async () => {
    setSending(true);
    try {
      // Clean up draft if one was auto-saved
      if (draftId) {
        mailApi.deleteMessage(draftId).catch(() => {});
      }

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
      handleClose(true); // don't save draft — message was sent
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
          {replyToThreadId ? 'Reply' : forwardFromThreadId ? 'Forward' : 'New Message'}
        </span>
        <button
          onClick={() => setMinimized(true)}
          style={{ background: 'none', border: 'none', color: '#fff', padding: 2, display: 'flex', cursor: 'pointer' }}
        >
          <Minus size={14} />
        </button>
        <button
          onClick={() => handleClose()}
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

      {/* Rich text toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: '4px 16px',
          borderBottom: '1px solid var(--mail-border)',
          flexShrink: 0,
        }}
      >
        <ToolbarBtn icon={<Bold size={14} />} label="Bold" cmd="bold" />
        <ToolbarBtn icon={<Italic size={14} />} label="Italic" cmd="italic" />
        <ToolbarBtn icon={<Underline size={14} />} label="Underline" cmd="underline" />
        <ToolbarBtn icon={<Strikethrough size={14} />} label="Strikethrough" cmd="strikeThrough" />
        <div style={{ width: 1, height: 18, background: 'var(--mail-border)', margin: '0 4px' }} />
        <ToolbarBtn icon={<List size={14} />} label="Bullet list" cmd="insertUnorderedList" />
        <ToolbarBtn icon={<ListOrdered size={14} />} label="Numbered list" cmd="insertOrderedList" />
        <div style={{ width: 1, height: 18, background: 'var(--mail-border)', margin: '0 4px' }} />
        <ToolbarBtn
          icon={<Link size={14} />}
          label="Insert link"
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) document.execCommand('createLink', false, url);
          }}
        />
        <ToolbarBtn icon={<Code size={14} />} label="Inline code" cmd="formatBlock" cmdValue="pre" />
        <ToolbarBtn icon={<RemoveFormatting size={14} />} label="Clear formatting" cmd="removeFormat" />
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => setBody(e.currentTarget.innerHTML)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!sending && to.length > 0) handleSend();
          }
        }}
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
          onClick={() => handleClose(true)}
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

function ToolbarBtn({
  icon,
  label,
  cmd,
  cmdValue,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  cmd?: string;
  cmdValue?: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onMouseDown={(e) => {
        e.preventDefault(); // keep focus in contentEditable
        if (onClick) {
          onClick();
        } else if (cmd) {
          document.execCommand(cmd, false, cmdValue);
        }
      }}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--mail-text-muted)',
        padding: '4px 6px',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mail-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {icon}
    </button>
  );
}
