import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MailThread } from '@haseen-me/api-client';
import { mailApi } from '@/api/client';
import { useMailStore } from '@/store/mail';

const PAGE_SIZE = 25;

export function useMailboxData() {
  const {
    activeLabel,
    threads,
    setThreads,
    appendThreads,
    setCursor,
    setHasMore,
    setLoading,
    loading,
    cursor,
    hasMore,
    loadingMore,
    setLoadingMore,
    setUserLabels,
    upsertThread,
    removeThread,
    patchThread,
  } = useMailStore();
  const [error, setError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const loadMailbox = useCallback(
    async (label = activeLabel) => {
      setLoading(true);
      try {
        const data = await mailApi.getMailbox(label, { limit: PAGE_SIZE });
        setThreads(data.threads as MailThread[]);
        setCursor(data.nextCursor ?? null);
        setHasMore(data.hasMore);
        setLastSyncAt(new Date().toISOString());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mailbox');
      } finally {
        setLoading(false);
      }
    },
    [activeLabel, setCursor, setHasMore, setLoading, setThreads],
  );

  const loadLabels = useCallback(async () => {
    try {
      const labels = await mailApi.listLabels();
      setUserLabels(
        labels
          .filter((label) => !label.isSystem)
          .map((label) => ({ id: label.id, name: label.name, color: label.color })),
      );
    } catch {
      setUserLabels([]);
    }
  }, [setUserLabels]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await mailApi.getMailbox(activeLabel, { limit: PAGE_SIZE, cursor });
      appendThreads(data.threads as MailThread[]);
      setCursor(data.nextCursor ?? null);
      setHasMore(data.hasMore);
      setLastSyncAt(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
    } finally {
      setLoadingMore(false);
    }
  }, [
    activeLabel,
    appendThreads,
    cursor,
    hasMore,
    loadingMore,
    setCursor,
    setHasMore,
    setLoadingMore,
  ]);

  useEffect(() => {
    void loadMailbox(activeLabel);
  }, [activeLabel, loadMailbox]);

  useEffect(() => {
    void loadLabels();
  }, [loadLabels]);

  const sortedThreads = useMemo(
    () =>
      [...threads].sort(
        (left, right) =>
          new Date(right.lastMessageDate).getTime() - new Date(left.lastMessageDate).getTime(),
      ),
    [threads],
  );

  return {
    activeLabel,
    loading,
    loadingMore,
    hasMore,
    cursor,
    error,
    lastSyncAt,
    threads: sortedThreads,
    loadMailbox,
    loadLabels,
    loadMore,
    setError,
    upsertThread,
    removeThread,
    patchThread,
  };
}
