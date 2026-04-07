import { type ReactNode, useState, useCallback, useRef } from 'react';
import { Upload, Menu } from 'lucide-react';
import { ProductRail } from '@/components/ProductRail';
import { Sidebar } from './Sidebar';
import { useDriveStore } from '@/store/drive';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@haseen-me/shared/toast';
import { encryptSymmetric, deriveSessionKey } from '@haseen-me/crypto';
import { driveApi } from '@/api/client';

export function DriveLayout({ children }: { children: ReactNode }) {
  const [dragOver, setDragOver] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dragCounter = useRef(0);
  const { currentFolderId } = useDriveStore();
  const { encryptionKeyPair } = useCryptoStore();
  const toast = useToastStore();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    try {
      for (const file of droppedFiles) {
        const buffer = await file.arrayBuffer();

        if (encryptionKeyPair) {
          const sessionKey = deriveSessionKey();
          const encrypted = encryptSymmetric(new Uint8Array(buffer), sessionKey);
          const encryptedBuffer = new Uint8Array(encrypted.nonce.length + encrypted.ciphertext.length);
          encryptedBuffer.set(encrypted.nonce);
          encryptedBuffer.set(encrypted.ciphertext, encrypted.nonce.length);
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
      toast.show(`${droppedFiles.length} file${droppedFiles.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.show('Upload failed');
    }
  }, [encryptionKeyPair, currentFolderId, toast]);

  return (
    <div
      style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="drive-product-rail">
        <ProductRail activeProduct="drive" />
      </div>
      {/* Mobile header */}
      <div
        className="drive-mobile-header"
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          background: 'var(--drive-bg)',
          borderBottom: '1px solid var(--drive-border)',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          zIndex: 250,
        }}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--drive-text)', padding: 4, display: 'flex' }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Drive</span>
      </div>
      <div
        className={`drive-sidebar-backdrop${mobileSidebarOpen ? ' mobile-open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <Sidebar mobileSidebarOpen={mobileSidebarOpen} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden', position: 'relative' }}>
        {children}
        {dragOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(45, 184, 175, 0.08)',
              border: '2px dashed var(--drive-brand)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              zIndex: 50,
              pointerEvents: 'none',
            }}
          >
            <Upload size={48} style={{ color: 'var(--drive-brand)' }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--drive-brand)' }}>
              Drop files to upload
            </div>
            <div style={{ fontSize: 13, color: 'var(--drive-text-muted)' }}>
              Files will be encrypted and uploaded
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
