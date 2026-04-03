import { useEffect } from 'react';
import { MailLayout } from '@/layout/MailLayout';
import { MailboxList } from '@/components/MailboxList';
import { ThreadView } from '@/components/ThreadView';
import { ComposePanel } from '@/components/ComposePanel';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useMailStore } from '@/store/mail';
import { MOCK_THREADS } from '@/data/mock';

export function App() {
  const setThreads = useMailStore((s) => s.setThreads);

  // Load mock data on mount (replace with API call later)
  useEffect(() => {
    setThreads(MOCK_THREADS);
  }, [setThreads]);

  return (
    <MailLayout>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <MailboxList />
        <ThreadView />
      </div>
      <ComposePanel />
      <SearchOverlay />
    </MailLayout>
  );
}
