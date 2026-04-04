import { useState, useEffect, useRef, useCallback } from 'react';
import { useMailStore } from '@/store/mail';
import { MailboxHeader } from './MailboxHeader';
import { ThreadRow } from './ThreadRow';
import { EmptyState } from './EmptyState';

const PAGE_SIZE = 25;

export function MailboxList() {
  const { activeLabel, threads, loading, sortBy } = useMailStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = threads
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

  const hasMore = visibleCount < filtered.length;

  // Reset visible count when label changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeLabel]);

  // IntersectionObserver for infinite scroll
  const observerCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasMore) {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
      }
    },
    [hasMore, filtered.length],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(observerCallback, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [observerCallback]);

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
          <>
            {filtered
              .slice(0, visibleCount)
              .map((thread) => <ThreadRow key={thread.id} thread={thread} />)}
            {hasMore && (
              <div
                ref={sentinelRef}
                style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--mail-text-muted)' }}
              >
                Loading more...
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
