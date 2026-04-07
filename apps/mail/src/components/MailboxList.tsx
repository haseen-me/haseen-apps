import { useEffect, useRef, useCallback } from 'react';
import { useMailStore } from '@/store/mail';
import { mailApi } from '@/api/client';
import { MailboxHeader } from './MailboxHeader';
import { ThreadRow } from './ThreadRow';
import { EmptyState } from './EmptyState';

export function MailboxList() {
  const { activeLabel, threads, loading, sortBy, cursor, hasMore, loadingMore, appendThreads, setCursor, setHasMore, setLoadingMore } = useMailStore();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const sorted = [...threads]
    .filter((t) => t.labels.includes(activeLabel))
    .sort((a, b) => {
      if (sortBy === 'sender') {
        const aFrom = a.messages[0]?.from?.name || a.messages[0]?.from?.address || '';
        const bFrom = b.messages[0]?.from?.name || b.messages[0]?.from?.address || '';
        return aFrom.localeCompare(bFrom);
      }
      if (sortBy === 'subject') {
        return a.subject.localeCompare(b.subject);
      }
      // default: date desc
      return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
    });

  // Fetch more threads from server when sentinel is visible
  const fetchMore = useCallback(() => {
    if (loadingMore || !hasMore || !cursor) return;
    setLoadingMore(true);
    mailApi
      .getMailbox(activeLabel, { limit: 25, cursor })
      .then((data) => {
        appendThreads(data.threads);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore);
      })
      .catch(() => {
        // Stop paginating on error
        setHasMore(false);
      })
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, cursor, activeLabel, appendThreads, setCursor, setHasMore, setLoadingMore]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchMore();
      },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <div
      style={{
        width: '100%',
        borderRight: '1px solid var(--mail-border)',
        display: 'flex',
        flexDirection: 'column',
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
        ) : sorted.length === 0 ? (
          <EmptyState label={activeLabel} />
        ) : (
          <>
            {sorted.map((thread) => <ThreadRow key={thread.id} thread={thread} />)}
            {hasMore && (
              <div
                ref={sentinelRef}
                style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--mail-text-muted)' }}
              >
                {loadingMore ? 'Loading more...' : '\u00A0'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
