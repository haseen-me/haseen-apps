import { type ReactNode, useState, useCallback, useRef } from 'react';
import { Upload, Menu } from 'lucide-react';
import { AppShell, AppShellMain, IconButton, Type, Size, Typography, TypographySize } from '@haseen-me/ui';
import { ProductRail } from '@haseen-me/shared/ProductRail';
import { Sidebar } from './Sidebar';
import { useDriveStore } from '@/store/drive';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@haseen-me/shared/toast';
import { encryptSymmetric, deriveSessionKey } from '@haseen-me/crypto';
import { driveApi } from '@/api/client';

const RAIL_WIDTH = 48;
const SIDEBAR_WIDTH = 220;

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
    <AppShell
      sidebar={
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
          <div className="drive-product-rail" style={{ width: RAIL_WIDTH, flexShrink: 0 }}>
            <ProductRail activeProduct="drive" />
          </div>
          <Sidebar mobileSidebarOpen={mobileSidebarOpen} />
        </div>
      }
      sidebarWidth={RAIL_WIDTH + SIDEBAR_WIDTH}
    >
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
          background: 'var(--hsn-bg-header)',
          borderBottom: '1px solid var(--hsn-border-primary)',
          alignItems: 'center',
          padding: '0 12px',
          gap: 10,
          zIndex: 250,
        }}
      >
        <IconButton
          icon={<Menu size={20} />}
          onClick={() => setMobileSidebarOpen(true)}
          type={Type.TERTIARY}
          size={Size.SMALL}
        />
        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--hsn-text-primary)' }}>Drive</span>
      </div>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--hsn-bg-overlay)',
            zIndex: 199,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <AppShellMain
        noPadding
        style={{ overflow: 'hidden' }}
      >
        <div
          style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {children}
        {children}

        {dragOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(45, 184, 175, 0.06)',
              border: '2px dashed var(--hsn-accent-teal)',
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
            <Upload size={48} style={{ color: 'var(--hsn-accent-teal)' }} />
            <Typography size={TypographySize.H3} style={{ color: 'var(--hsn-accent-teal)' }}>
              Drop files to upload
            </Typography>
            <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
              Files will be encrypted and uploaded
            </Typography>
          </div>
        )}
        </div>
      </AppShellMain>
    </AppShell>
  );
}
