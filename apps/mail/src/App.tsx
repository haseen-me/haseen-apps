import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { requireAuth } from '@haseen-me/shared';
import { MailLayout } from '@/layout/MailLayout';
import { MailboxList } from '@/components/MailboxList';
import { ThreadView } from '@/components/ThreadView';
import { ComposePanel } from '@/components/ComposePanel';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@/store/toast';
import { mailApi } from '@/api/client';
import { MOCK_THREADS } from '@/data/mock';
import { Toast } from '@haseen-me/ui';

export function App() {
  const [authed, setAuthed] = useState(false);
  const { activeLabel, setThreads, setLoading } = useMailStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Check auth on mount
  useEffect(() => {
    if (requireAuth()) setAuthed(true);
  }, []);

  // Initialize encryption keys
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Load mailbox — try API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    mailApi
      .getMailbox(activeLabel)
      .then((data) => {
        if (!cancelled) {
          setThreads(data.threads);
        }
      })
      .catch(() => {
        // Backend unavailable — use mock data
        if (!cancelled) {
          setThreads(MOCK_THREADS);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeLabel, setThreads, setLoading]);

  if (!authed) return null;

  return (
    <ErrorBoundary>
    <MailLayout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <MailboxList />
        <ThreadView />
      </div>
      <ComposePanel />
      <SearchOverlay />
      <Toast message={toast.message} visible={toast.visible} onDismiss={toast.hide} />
    </MailLayout>
    </ErrorBoundary>
  );
}
