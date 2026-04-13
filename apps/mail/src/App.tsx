import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { requireAuth } from '@haseen-me/shared';
import { MailLayout } from '@/layout/MailLayout';
import { MailboxList } from '@/components/MailboxList';
import { ThreadView } from '@/components/ThreadView';
import { ComposePanel } from '@/components/ComposePanel';
import { SearchOverlay } from '@/components/SearchOverlay';
import { DomainsPage } from '@/components/domains/DomainsPage';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { useToastStore } from '@haseen-me/shared/toast';
import { mailApi } from '@/api/client';
import { MOCK_THREADS } from '@/data/mock';
import { Toast } from '@haseen-me/ui';

export function App() {
  const [authed, setAuthed] = useState(false);
  const { activeLabel, activeThreadId, threads, setThreads, appendThreads, setCursor, setHasMore, setLoading, setUserLabels, setComposeOpen, setActiveThreadId, setReplyToThreadId, setForwardFromThreadId, settingsView } = useMailStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Check auth on mount
  useEffect(() => {
    void requireAuth().then((ok) => {
      if (ok) setAuthed(true);
    });
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
      .getMailbox(activeLabel, { limit: 25 })
      .then((data) => {
        if (!cancelled) {
          setThreads(data.threads);
          setCursor(data.nextCursor ?? null);
          setHasMore(data.hasMore);
        }
      })
      .catch(() => {
        // Backend unavailable — use mock data
        if (!cancelled) {
          setThreads(MOCK_THREADS);
          setCursor(null);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeLabel, setThreads, setCursor, setHasMore, setLoading]);

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

  // Poll for new mail every 30s — check first page only, prepend new threads
  useEffect(() => {
    const interval = setInterval(() => {
      mailApi
        .getMailbox(activeLabel, { limit: 25 })
        .then((data) => {
          const currentIds = new Set(threads.map((t) => t.id));
          const newThreads = data.threads.filter((t) => !currentIds.has(t.id));
          if (newThreads.length > 0) {
            setThreads([...newThreads, ...threads]);
            toast.show(`${newThreads.length} new message${newThreads.length > 1 ? 's' : ''}`);
          }
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [activeLabel, threads, setThreads, toast]);

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

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/contentEditable
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      switch (e.key) {
        case 'c':
          e.preventDefault();
          setComposeOpen(true);
          break;
        case 'r':
          if (activeThreadId) {
            e.preventDefault();
            setReplyToThreadId(activeThreadId);
            setComposeOpen(true);
          }
          break;
        case 'f':
          if (activeThreadId) {
            e.preventDefault();
            setForwardFromThreadId(activeThreadId);
            setComposeOpen(true);
          }
          break;
        case 'Escape':
          if (activeThreadId) {
            e.preventDefault();
            setActiveThreadId(null);
          }
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeThreadId, setComposeOpen, setActiveThreadId, setReplyToThreadId, setForwardFromThreadId]);

  if (!authed) return null;

  return (
    <ErrorBoundary>
    <MailLayout>
      {settingsView === 'domains' ? (
        <DomainsPage />
      ) : (
        <>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', paddingTop: 'var(--mail-mobile-header, 0px)' }}>
            <div className={`mail-thread-list${activeThreadId ? ' mobile-hidden' : ''}`}>
              <MailboxList />
            </div>
            <div className={`mail-thread-detail${!activeThreadId ? ' mobile-hidden' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
              <ThreadView />
            </div>
          </div>
          <ComposePanel />
          <SearchOverlay />
        </>
      )}
      <Toast
        message={toast.countdown ? `${toast.message} (${toast.countdown}s)` : toast.message}
        visible={toast.visible}
        onDismiss={toast.hide}
        action={toast.action ?? undefined}
        duration={toast.countdown ? 0 : undefined}
      />
    </MailLayout>
    </ErrorBoundary>
  );
}
