import { useMailStore } from '@/store/mail';
import { MailboxHeader } from './MailboxHeader';
import { ThreadRow } from './ThreadRow';
import { EmptyState } from './EmptyState';

export function MailboxList() {
  const { activeLabel, threads, loading } = useMailStore();

  const filtered = threads.filter((t) => t.labels.includes(activeLabel));

  return (
    <div
      style={{
        width: 380,
        borderRight: '1px solid var(--mail-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <MailboxHeader />

      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div
            style={{
              padding: 40,
              textAlign: 'center',
              color: 'var(--mail-text-muted)',
              fontSize: 14,
            }}
          >
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState label={activeLabel} />
        ) : (
          filtered
            .sort((a, b) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime())
            .map((thread) => <ThreadRow key={thread.id} thread={thread} />)
        )}
      </div>
    </div>
  );
}
