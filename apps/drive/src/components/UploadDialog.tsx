import { X, Upload, FileUp, Lock } from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
import { useDriveStore } from '@/store/drive';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@haseen-me/shared/toast';
import { encryptSymmetric, deriveSessionKey } from '@haseen-me/crypto';
import { driveApi } from '@/api/client';

export function UploadDialog() {
  const { uploadOpen, setUploadOpen, currentFolderId } = useDriveStore();
  const { encryptionKeyPair } = useCryptoStore();
  const toast = useToastStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadIndex, setUploadIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    setUploadIndex(0);
    try {
      for (let fi = 0; fi < selectedFiles.length; fi++) {
        setUploadIndex(fi + 1);
        const file = selectedFiles[fi]!;
        const buffer = await file.arrayBuffer();

        if (encryptionKeyPair) {
          // Encrypt file data with a per-file session key
          const sessionKey = deriveSessionKey();
          const encrypted = encryptSymmetric(new Uint8Array(buffer), sessionKey);
          const encryptedBuffer = new Uint8Array(encrypted.nonce.length + encrypted.ciphertext.length);
          encryptedBuffer.set(encrypted.nonce);
          encryptedBuffer.set(encrypted.ciphertext, encrypted.nonce.length);

          // Encode session key as base64 for storage
          const encryptedKey = btoa(String.fromCharCode(...sessionKey));

          await driveApi.uploadFile({
            name: file.name,
            encryptedData: encryptedBuffer.buffer,
            encryptedKey,
            folderID: currentFolderId === 'root' ? undefined : currentFolderId,
          });
        } else {
          await driveApi.uploadFile({
            name: file.name,
            encryptedData: buffer,
            encryptedKey: '',
            folderID: currentFolderId === 'root' ? undefined : currentFolderId,
          });
        }
      }
      toast.show(`${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded`);
    } catch (err) {
      console.warn('[Drive] Upload failed:', err);
      toast.show('Upload failed — backend unavailable');
    } finally {
      setUploading(false);
      setUploadIndex(0);
      setSelectedFiles([]);
      setUploadOpen(false);
    }
  }, [selectedFiles, encryptionKeyPair, currentFolderId, setUploadOpen, toast]);

  const handleClose = useCallback(() => {
    setSelectedFiles([]);
    setUploadOpen(false);
  }, [setUploadOpen]);

  if (!uploadOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--hsn-bg-l1-solid)',
          borderRadius: '8px',
          boxShadow: 'var(--hsn-shadow-l3)',
          width: 480,
          maxWidth: '90vw',
          padding: 24,
          animation: 'fadeIn 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Upload files</h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--hsn-text-tertiary)',
              padding: 4,
              borderRadius: 4,
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--hsn-accent-teal)' : 'var(--hsn-border-primary)'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(45,184,175,0.08)' : 'var(--hsn-bg-l0-solid)',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <FileUp size={32} style={{ color: 'var(--hsn-accent-teal)', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Drag and drop files here
          </div>
          <div style={{ fontSize: 13, color: 'var(--hsn-text-tertiary)', marginTop: 4 }}>
            or click to browse
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={handleSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Selected files */}
        {selectedFiles.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 200, overflow: 'auto' }}>
            {selectedFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--hsn-bg-l0-solid)',
                  marginBottom: 4,
                  fontSize: 13,
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.name}
                </span>
                <button
                  onClick={() => setSelectedFiles((p) => p.filter((_, j) => j !== i))}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--hsn-text-tertiary)',
                    padding: 2,
                    display: 'flex',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid var(--hsn-border-primary)',
              background: 'var(--hsn-bg-l1-solid)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--hsn-text-primary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: selectedFiles.length > 0 && !uploading ? 'var(--hsn-accent-teal)' : 'var(--hsn-border-primary)',
              color: selectedFiles.length > 0 && !uploading ? '#fff' : 'var(--hsn-text-tertiary)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {encryptionKeyPair && <Lock size={12} />}
            <Upload size={14} />
            {uploading ? `Uploading ${uploadIndex}/${selectedFiles.length}...` : `Upload${selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}`}
          </button>
        </div>

        {/* Upload progress bar */}
        {uploading && selectedFiles.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--hsn-text-tertiary)', marginBottom: 4 }}>
              Encrypting and uploading file {uploadIndex} of {selectedFiles.length}...
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--hsn-border-primary)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: 'var(--hsn-accent-teal)', transition: 'width 0.3s', width: `${(uploadIndex / selectedFiles.length) * 100}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
