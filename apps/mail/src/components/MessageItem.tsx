import type { Message } from '@/types/mail';
import { useCryptoStore } from '@/store/crypto';
import { openEnvelope } from '@haseen-me/crypto';
import type { EncryptedEnvelope } from '@haseen-me/crypto';
import DOMPurify from 'dompurify';
import {
  ChevronDown,
  ChevronUp,
  Lock,
  Paperclip,
  Download,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useState, useMemo } from 'react';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
    ' at ' +
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
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

export function MessageItem({ message, isLast }: { message: Message; isLast: boolean }) {
  const [collapsed, setCollapsed] = useState(!isLast);
  const from = message.from;
  const { encryptionKeyPair, signingKeyPair } = useCryptoStore();

  // Attempt to decrypt message body if it's an encrypted envelope
  const decryptedBody = useMemo(() => {
    if (!message.encrypted || !encryptionKeyPair || !signingKeyPair) return null;
    try {
      const envelope: EncryptedEnvelope = JSON.parse(message.bodyHtml);
      // Use the sender's encrypted session key from the envelope itself
      const sessionKeyData = envelope.encryptedSessionKey;
      const combined = new Uint8Array(sessionKeyData.nonce.length + sessionKeyData.ciphertext.length);
      combined.set(new Uint8Array(Object.values(sessionKeyData.nonce)));
      combined.set(new Uint8Array(Object.values(sessionKeyData.ciphertext)), sessionKeyData.nonce.length);

      return openEnvelope(
        envelope,
        combined,
        encryptionKeyPair,
        signingKeyPair.publicKey,
      );
    } catch {
      // Not a JSON envelope — it's mock data with HTML, show as-is
      return null;
    }
  }, [message.bodyHtml, message.encrypted, encryptionKeyPair, signingKeyPair]);

  const displayBody = decryptedBody ?? message.bodyHtml;

  return (
    <div
      style={{
        borderBottom: '1px solid var(--mail-border-subtle)',
        background: 'var(--mail-bg)',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: stringToColor(from.name || from.address),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {avatar(from.name || from.address)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{from.name || from.address}</span>
            <span style={{ fontSize: 12, color: 'var(--mail-text-muted)' }}>
              &lt;{from.address}&gt;
            </span>
          </div>
          {collapsed && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--mail-text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: 2,
              }}
            >
              {message.bodyText.slice(0, 120)}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {message.encrypted && (
            <Lock size={14} style={{ color: 'var(--mail-brand)' }} />
          )}
          <span style={{ fontSize: 12, color: 'var(--mail-text-muted)', whiteSpace: 'nowrap' }}>
            {formatShortDate(message.date)}
          </span>
          {collapsed ? <ChevronDown size={16} style={{ color: 'var(--mail-text-muted)' }} /> : <ChevronUp size={16} style={{ color: 'var(--mail-text-muted)' }} />}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: '0 20px 16px 68px' }}>
          {/* Recipients */}
          <div style={{ fontSize: 12, color: 'var(--mail-text-muted)', marginBottom: 8 }}>
            <span>To: {message.to.map((r) => r.name || r.address).join(', ')}</span>
            {message.cc.length > 0 && (
              <span style={{ marginLeft: 12 }}>Cc: {message.cc.map((r) => r.name || r.address).join(', ')}</span>
            )}
          </div>

          {/* Date */}
          <div style={{ fontSize: 12, color: 'var(--mail-text-muted)', marginBottom: 12 }}>
            {formatFullDate(message.date)}
          </div>

          {/* Encryption badge */}
          {message.encrypted && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 20,
                background: 'var(--mail-brand-subtle)',
                color: 'var(--mail-brand)',
                marginBottom: 12,
                fontWeight: 500,
              }}
            >
              {message.encryptionInfo?.signatureValid !== false ? (
                <>
                  <ShieldCheck size={13} />
                  E2E encrypted · Signature verified
                </>
              ) : (
                <>
                  <ShieldAlert size={13} />
                  E2E encrypted · Signature invalid
                </>
              )}
            </div>
          )}

          {/* HTML body */}
          {decryptedBody ? (
            <div
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--mail-text)',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {decryptedBody}
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message.bodyHtml) }}
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--mail-text)',
                overflowWrap: 'break-word',
              }}
            />
          )}

          {/* Attachments */}
          {message.attachments.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--mail-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <Paperclip size={13} />
                {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {message.attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderRadius: 'var(--mail-radius-sm)',
                      border: '1px solid var(--mail-border)',
                      fontSize: 13,
                      cursor: 'pointer',
                      background: 'var(--mail-bg-secondary)',
                    }}
                  >
                    <Paperclip size={14} style={{ color: 'var(--mail-text-muted)' }} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{att.filename}</div>
                      <div style={{ fontSize: 11, color: 'var(--mail-text-muted)' }}>{formatSize(att.size)}</div>
                    </div>
                    <Download size={14} style={{ color: 'var(--mail-text-muted)', marginLeft: 8 }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
