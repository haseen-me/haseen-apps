import { useState, useEffect } from 'react';
import { X, Download, FileText, File } from 'lucide-react';
import { useDriveStore } from '@/store/drive';
import { driveApi } from '@/api/client';
import { decryptSymmetric } from '@haseen-me/crypto';
import { formatFileSize } from '@/types/drive';

function isImage(mime: string) {
  return /^image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp)$/i.test(mime);
}
function isPdf(mime: string) {
  return mime === 'application/pdf';
}
function isText(mime: string) {
  return (
    mime.startsWith('text/') ||
    mime === 'application/json' ||
    mime === 'application/xml' ||
    mime === 'application/javascript'
  );
}

export function FilePreviewPanel() {
  const { files, previewFileId, setPreviewFileId } = useDriveStore();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const file = files.find((f) => f.id === previewFileId);

  useEffect(() => {
    if (!file) {
      setBlobUrl(null);
      setTextContent(null);
      return;
    }

    let cancelled = false;
    const prevUrl = blobUrl;

    async function loadPreview() {
      if (!file) return;
      const mime = file.mimeType || '';
      if (!isImage(mime) && !isPdf(mime) && !isText(mime)) return;

      setLoading(true);
      setError(null);
      try {
        const buffer = await driveApi.downloadFile(file.id);
        if (cancelled) return;

        let blob: Blob;
        if (file.encryptedKey) {
          const keyBytes = Uint8Array.from(atob(file.encryptedKey), (c) => c.charCodeAt(0));
          const data = new Uint8Array(buffer);
          const nonce = data.slice(0, 24);
          const ciphertext = data.slice(24);
          const plaintext = decryptSymmetric({ ciphertext, nonce }, keyBytes);
          blob = new Blob([plaintext.slice().buffer as ArrayBuffer], { type: mime });
        } else {
          blob = new Blob([buffer], { type: mime });
        }

        if (cancelled) return;

        if (isText(mime)) {
          const text = await blob.text();
          if (!cancelled) setTextContent(text);
        } else {
          const url = URL.createObjectURL(blob);
          if (!cancelled) setBlobUrl(url);
        }
      } catch {
        if (!cancelled) setError('Failed to load preview');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setBlobUrl(null);
    setTextContent(null);
    loadPreview();

    return () => {
      cancelled = true;
      if (prevUrl) URL.revokeObjectURL(prevUrl);
    };
  }, [previewFileId]);

  if (!file) return null;

  const mime = file.mimeType || '';

  const handleDownload = async () => {
    try {
      const buffer = await driveApi.downloadFile(file.id);
      let blob: Blob;
      if (file.encryptedKey) {
        const keyBytes = Uint8Array.from(atob(file.encryptedKey), (c) => c.charCodeAt(0));
        const data = new Uint8Array(buffer);
        const nonce = data.slice(0, 24);
        const ciphertext = data.slice(24);
        const plaintext = decryptSymmetric({ ciphertext, nonce }, keyBytes);
        blob = new Blob([plaintext.slice().buffer as ArrayBuffer], { type: mime });
      } else {
        blob = new Blob([buffer], { type: mime });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // download failed
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={() => setPreviewFileId(null)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--drive-bg)',
          border: '1px solid var(--drive-border)',
          borderRadius: 'var(--drive-radius)',
          width: '80vw',
          maxWidth: 900,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid var(--drive-border)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <FileText size={18} style={{ color: 'var(--drive-brand)', flexShrink: 0 }} />
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </span>
            <span style={{ fontSize: 12, color: 'var(--drive-text-muted)', flexShrink: 0 }}>
              {formatFileSize(file.size)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={handleDownload}
              title="Download"
              style={{
                background: 'none',
                border: '1px solid var(--drive-border)',
                borderRadius: 'var(--drive-radius-sm)',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: 'var(--drive-text)',
              }}
            >
              <Download size={14} /> Download
            </button>
            <button
              onClick={() => setPreviewFileId(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--drive-text-muted)',
                padding: 4,
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {loading ? (
            <div style={{ color: 'var(--drive-text-muted)', fontSize: 14 }}>Loading preview...</div>
          ) : error ? (
            <div style={{ color: '#dc3545', fontSize: 14 }}>{error}</div>
          ) : isImage(mime) && blobUrl ? (
            <img
              src={blobUrl}
              alt={file.name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
            />
          ) : isPdf(mime) && blobUrl ? (
            <iframe
              src={blobUrl}
              title={file.name}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 }}
            />
          ) : isText(mime) && textContent !== null ? (
            <pre
              style={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                margin: 0,
                padding: 16,
                fontSize: 13,
                fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
                background: 'var(--drive-bg-secondary, #fafafa)',
                borderRadius: 8,
                color: 'var(--drive-text)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {textContent}
            </pre>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                color: 'var(--drive-text-muted)',
              }}
            >
              <File size={48} />
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--drive-text)' }}>{file.name}</div>
              <div style={{ fontSize: 13 }}>{mime || 'Unknown type'} · {formatFileSize(file.size)}</div>
              <div style={{ fontSize: 13 }}>No preview available for this file type.</div>
              <button
                onClick={handleDownload}
                style={{
                  marginTop: 8,
                  padding: '10px 24px',
                  background: 'var(--drive-brand)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--drive-radius-sm)',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Download size={16} /> Download file
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
