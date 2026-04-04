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
  const { activeLabel, activeThreadId, threads, setThreads, setLoading, setUserLabels } = useMailStore();
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

  // Load user labels on mount
  useEffect(() => {
    mailApi
      .listLabels()
      .then((labels) => {
        const userLabels = labels
          .filter((l) => !l.isSystem)
          .map((l) => ({ id: l.id, name: l.name, color: l.color }));
        setUserLabels(userLabels);
      })
      .catch(() => {
        // Labels API unavailable — keep empty
      });
  }, [setUserLabels]);

  // Auto mark-as-read when opening a thread
  useEffect(() => {
    if (!activeThreadId) return;
    const thread = threads.find((t) => t.id === activeThreadId);
    if (!thread || thread.unreadCount === 0) return;

    const unreadMsgs = thread.messages.filter((m) => !m.read);
    if (unreadMsgs.length === 0) return;

    Promise.all(unreadMsgs.map((m) => mailApi.updateMessage(m.id, { read: true }))).catch(() => {});
    // Optimistic update
    setThreads(
      threads.map((t) =>
        t.id === activeThreadId
          ? { ...t, unreadCount: 0, messages: t.messages.map((m) => ({ ...m, read: true })) }
          : t,
      ),
    );
  }, [activeThreadId]);

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
