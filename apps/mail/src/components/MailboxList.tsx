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
          <div style={{ padding: '8px 0' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--mail-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ width: 120, height: 14, borderRadius: 4, background: 'var(--mail-bg-hover, #f0f0f0)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                  <div style={{ width: 50, height: 12, borderRadius: 4, background: 'var(--mail-bg-hover, #f0f0f0)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                </div>
                <div style={{ width: '80%', height: 13, borderRadius: 4, background: 'var(--mail-bg-hover, #f0f0f0)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
                <div style={{ width: '60%', height: 12, borderRadius: 4, background: 'var(--mail-bg-hover, #f0f0f0)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
              </div>
            ))}
            <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
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
