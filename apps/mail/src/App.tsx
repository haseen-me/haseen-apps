import { useEffect } from 'react';
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
  const { setThreads, setLoading } = useMailStore();
  const initializeKeys = useCryptoStore((s) => s.initializeKeys);
  const initialized = useCryptoStore((s) => s.initialized);
  const toast = useToastStore();

  // Initialize encryption keys
  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initialized, initializeKeys]);

  // Load mailbox — try API, fall back to mock data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    mailApi
      .getMailbox()
      .then((data) => {
        if (!cancelled) {
          // Transform API response to Thread format
          const threads = data.messages.map((msg) => ({
            id: msg.threadID,
            subject: msg.encryptedSubject,
            snippet: msg.encryptedBody.slice(0, 100),
            lastMessageDate: msg.createdAt,
            unreadCount: msg.read ? 0 : 1,
            labels: [msg.label],
            from: { name: msg.from, address: msg.from },
            hasAttachments: false,
            messages: [
              {
                id: msg.id,
                threadId: msg.threadID,
                from: { name: msg.from, address: msg.from },
                to: msg.to.map((addr) => ({ address: addr })),
                cc: [],
                bcc: [],
                subject: msg.encryptedSubject,
                bodyHtml: msg.encryptedBody,
                bodyText: msg.encryptedBody,
                attachments: [],
                date: msg.createdAt,
                read: msg.read,
                starred: false,
                labels: [msg.label],
                encrypted: true,
                encryptionInfo: {
                  sessionKeyEncrypted: msg.encryptedSessionKey,
                  senderSigningKey: '',
                  signatureValid: true,
                },
              },
            ],
          }));
          setThreads(threads);
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
  }, [setThreads, setLoading]);

  return (
    <MailLayout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <MailboxList />
        <ThreadView />
      </div>
      <ComposePanel />
      <SearchOverlay />
      <Toast message={toast.message} visible={toast.visible} onDismiss={toast.hide} />
    </MailLayout>
  );
}
