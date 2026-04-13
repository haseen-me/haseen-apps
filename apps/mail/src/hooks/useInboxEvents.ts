import { useEffect, useRef, useState } from 'react';
import type { MailEvent } from '@haseen-me/api-client';
import { mailApi } from '@/api/client';

type UseInboxEventsOptions = {
  onEvent: (event: MailEvent) => void;
};

export function useInboxEvents({ onEvent }: UseInboxEventsOptions) {
  const [connected, setConnected] = useState(false);
  const lastEventId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let fallbackTimer: number | null = null;
    const stream = new EventSource(mailApi.getEventStreamUrl(lastEventId.current ?? undefined), {
      withCredentials: true,
    });

    stream.onopen = () => {
      if (!cancelled) setConnected(true);
    };

    stream.onmessage = (message) => {
      try {
        const payload = JSON.parse(message.data) as MailEvent;
        lastEventId.current = payload.id;
        onEvent(payload);
      } catch {
        // Ignore malformed events and let polling recover state.
      }
    };

    stream.onerror = () => {
      if (cancelled) return;
      setConnected(false);
      fallbackTimer = window.setTimeout(() => {
        onEvent({
          id: `poll-${Date.now()}`,
          type: 'message.updated',
          userId: '',
          mailboxId: '',
          occurredAt: new Date().toISOString(),
        });
      }, 5000);
    };

    return () => {
      cancelled = true;
      setConnected(false);
      stream.close();
      if (fallbackTimer != null) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [onEvent]);

  return { connected };
}
