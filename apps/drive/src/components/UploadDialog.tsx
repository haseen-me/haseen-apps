import { X, Upload, FileUp } from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
import { useDriveStore } from '@/store/drive';

export function UploadDialog() {
  const { uploadOpen, setUploadOpen } = useDriveStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  const handleUpload = useCallback(() => {
    // In real app, call api.uploadFile for each
    setSelectedFiles([]);
    setUploadOpen(false);
  }, [setUploadOpen]);

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
          background: 'var(--drive-bg)',
          borderRadius: 'var(--drive-radius)',
          boxShadow: 'var(--drive-shadow-lg)',
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
              color: 'var(--drive-text-muted)',
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
            border: `2px dashed ${dragOver ? 'var(--drive-brand)' : 'var(--drive-border)'}`,
            borderRadius: 'var(--drive-radius)',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'var(--drive-brand-subtle)' : 'var(--drive-bg-secondary)',
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <FileUp size={32} style={{ color: 'var(--drive-brand)', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Drag and drop files here
          </div>
          <div style={{ fontSize: 13, color: 'var(--drive-text-muted)', marginTop: 4 }}>
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
                  borderRadius: 'var(--drive-radius-sm)',
                  background: 'var(--drive-bg-secondary)',
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
                    color: 'var(--drive-text-muted)',
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
              borderRadius: 'var(--drive-radius-sm)',
              border: '1px solid var(--drive-border)',
              background: 'var(--drive-bg)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--drive-text)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--drive-radius-sm)',
              border: 'none',
              background: selectedFiles.length > 0 ? 'var(--drive-brand)' : 'var(--drive-border)',
              color: selectedFiles.length > 0 ? '#fff' : 'var(--drive-text-muted)',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Upload size={14} />
            Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
