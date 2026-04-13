import { useCallback, useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import { requireAuth } from '@haseen-me/shared';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { HaseenThemeProvider, Toast } from '@haseen-me/ui';
import { useToastStore } from '@haseen-me/shared/toast';
import {
  Archive,
  CheckCheck,
  Clock3,
  MailPlus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { ComposePanel } from '@/components/ComposePanel';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useMailStore } from '@/store/mail';
import { useCryptoStore } from '@/store/crypto';
import { mailApi } from '@/api/client';
import { useMailboxData } from '@/hooks/useMailboxData';
import { useInboxEvents } from '@/hooks/useInboxEvents';
import { SYSTEM_LABELS, type Message, type Thread } from '@/types/mail';

function labelTitle(label: string) {
  return SYSTEM_LABELS.find((item) => item.id === label)?.name ?? label;
}

export function App() {
  const [authed, setAuthed] = useState(false);
  const toast = useToastStore();
  const initializeKeys = useCryptoStore((state) => state.initializeKeys);
  const initialized = useCryptoStore((state) => state.initialized);
  const {
    activeLabel,
    activeThreadId,
    setActiveLabel,
    setActiveThreadId,
    setComposeOpen,
    setReplyToThreadId,
    setForwardFromThreadId,
    setSearchOpen,
    setSettingsView,
    userLabels,
  } = useMailStore();
  const { threads, loading, loadingMore, hasMore, error, lastSyncAt, loadMailbox, loadMore, patchThread, removeThread } =
    useMailboxData();

  useEffect(() => {
    void requireAuth().then((ok) => {
      if (ok) setAuthed(true);
    });
  }, []);

  useEffect(() => {
    if (!initialized) initializeKeys();
  }, [initializeKeys, initialized]);

  useEffect(() => {
    setSettingsView('mail');
  }, [setSettingsView]);

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? null,
    [activeThreadId, threads],
  );

  const handleRealtimeEvent = useCallback(async () => {
    await loadMailbox(activeLabel);
  }, [activeLabel, loadMailbox]);

  const { connected } = useInboxEvents({ onEvent: handleRealtimeEvent });

  useEffect(() => {
    if (connected) return;
    const timer = window.setInterval(() => {
      void loadMailbox(activeLabel);
    }, 15000);
    return () => window.clearInterval(timer);
  }, [activeLabel, connected, loadMailbox]);

  useEffect(() => {
    if (!selectedThread || selectedThread.unreadCount === 0) return;
    const unreadMessages = selectedThread.messages.filter((message) => !message.read);
    if (unreadMessages.length === 0) return;
    patchThread(selectedThread.id, (thread) => ({
      ...thread,
      unreadCount: 0,
      messages: thread.messages.map((message) => ({ ...message, read: true })),
    }));
    void Promise.all(unreadMessages.map((message) => mailApi.updateMessage(message.id, { read: true })));
  }, [patchThread, selectedThread]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      switch (event.key) {
        case 'c':
          event.preventDefault();
          setComposeOpen(true);
          break;
        case '/':
          event.preventDefault();
          setSearchOpen(true);
          break;
        case 'Escape':
          event.preventDefault();
          setActiveThreadId(null);
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveThreadId, setComposeOpen, setSearchOpen]);

  const mutateThreadMessages = useCallback(
    async (
      thread: Thread,
      updater: (message: Message) => Message,
      request: (message: Message) => Promise<unknown>,
      successMessage: string,
      fallbackMessage: string,
    ) => {
      const previous = thread;
      patchThread(thread.id, (current) => ({
        ...current,
        messages: current.messages.map(updater),
        unreadCount: current.messages.map(updater).filter((message) => !message.read).length,
      }));
      try {
        await Promise.all(thread.messages.map((message) => request(message)));
        toast.show(successMessage);
      } catch {
        patchThread(thread.id, () => previous);
        toast.show(fallbackMessage);
      }
    },
    [patchThread, toast],
  );

  const moveThread = useCallback(
    async (thread: Thread, label: string, successMessage: string) => {
      removeThread(thread.id);
      try {
        await Promise.all(thread.messages.map((message) => mailApi.moveMessage(message.id, label)));
        toast.show(successMessage);
      } catch {
        await loadMailbox(activeLabel);
        toast.show(`Failed to move to ${labelTitle(label)}`);
      }
    },
    [activeLabel, loadMailbox, removeThread, toast],
  );

  if (!authed) return null;

  return (
    <HaseenThemeProvider>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,#07101f_0%,#050816_45%,#030511_100%)] text-white">
          <aside className="hidden w-[272px] shrink-0 border-r border-white/8 bg-black/20 p-4 backdrop-blur-xl lg:flex lg:flex-col">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 bg-cyan-300/10 p-3 text-cyan-200">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Haseen</p>
                  <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">Mail</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Native-feeling inbox with realtime delivery, glass surfaces, and optimistic actions.
              </p>
            </div>

            <button
              onClick={() => setComposeOpen(true)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-[22px] bg-cyan-300 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
            >
              <MailPlus size={16} /> Compose
            </button>

            <div className="mt-6 space-y-2">
              {SYSTEM_LABELS.map((label) => {
                const count = threads.filter((thread) => thread.labels.includes(label.id)).length;
                return (
                  <button
                    key={label.id}
                    onClick={() => setActiveLabel(label.id)}
                    className={`flex w-full items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm transition ${
                      activeLabel === label.id
                        ? 'border border-cyan-300/40 bg-cyan-300/10 text-white'
                        : 'border border-transparent bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{label.name}</span>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {userLabels.length > 0 ? (
              <div className="mt-6 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Custom labels</p>
                <div className="mt-3 space-y-2">
                  {userLabels.map((label) => (
                    <div key={label.id} className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: label.color || '#67e8f9' }}
                      />
                      <span>{label.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-auto rounded-[24px] border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 text-slate-300">
                {connected ? <Wifi size={15} className="text-emerald-300" /> : <WifiOff size={15} className="text-amber-300" />}
                {connected ? 'Realtime connected' : 'Polling fallback active'}
              </div>
              <p className="mt-2">Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleTimeString() : 'Waiting for first sync'}</p>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col lg:flex-row">
            <section className={`${activeThreadId ? 'hidden lg:flex' : 'flex'} min-h-0 flex-1 flex-col border-r border-white/8 bg-black/10`}>
              <div className="border-b border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-xl sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">Mailbox</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {labelTitle(activeLabel)}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Search size={15} /> Search
                    </button>
                    <button
                      onClick={() => void loadMailbox(activeLabel)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <RefreshCw size={15} /> Refresh
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                  <span>{threads.length} conversations</span>
                  <span className="inline-flex items-center gap-1">
                    {connected ? <ShieldCheck size={13} className="text-emerald-300" /> : <Clock3 size={13} className="text-amber-300" />}
                    {connected ? 'Push updates live' : '15s refresh cadence'}
                  </span>
                </div>
                {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                        <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
                        <div className="mt-3 h-4 w-52 animate-pulse rounded-full bg-white/10" />
                        <div className="mt-2 h-3 w-full animate-pulse rounded-full bg-white/10" />
                      </div>
                    ))}
                  </div>
                ) : threads.length === 0 ? (
                  <div className="mx-auto mt-16 max-w-md rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Zero state</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                      Inbox is clear.
                    </h2>
                    <p className="mt-3 text-sm text-slate-400">
                      New messages will appear here as soon as the backend receives and stores them.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {threads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => setActiveThreadId(thread.id)}
                        className={`w-full rounded-[24px] border p-4 text-left transition ${
                          activeThreadId === thread.id
                            ? 'border-cyan-300/40 bg-cyan-300/10'
                            : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-white">
                                {thread.from.name || thread.from.address}
                              </p>
                              {thread.unreadCount > 0 ? (
                                <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[11px] text-cyan-100">
                                  {thread.unreadCount} new
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 truncate text-base font-medium tracking-[-0.02em] text-white">
                              {thread.subject || '(No subject)'}
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                              {thread.snippet || 'No preview available'}
                            </p>
                          </div>
                          <div className="shrink-0 text-right text-xs text-slate-500">
                            <p>{new Date(thread.lastMessageDate).toLocaleDateString()}</p>
                            {thread.hasAttachments ? <p className="mt-2 text-slate-400">Attachment</p> : null}
                          </div>
                        </div>
                      </button>
                    ))}
                    {hasMore ? (
                      <button
                        onClick={() => void loadMore()}
                        className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                      >
                        {loadingMore ? 'Loading more…' : 'Load more conversations'}
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </section>

            <section className={`${activeThreadId ? 'flex' : 'hidden lg:flex'} min-h-0 flex-1 flex-col`}>
              {selectedThread ? (
                <>
                  <div className="border-b border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-xl sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <button
                          onClick={() => setActiveThreadId(null)}
                          className="mb-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 lg:hidden"
                        >
                          Back
                        </button>
                        <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">Thread</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                          {selectedThread.subject || '(No subject)'}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                          {selectedThread.messages.length} message{selectedThread.messages.length === 1 ? '' : 's'} in this conversation
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {(() => {
                          const nextStarred = !selectedThread.messages.every((message) => message.starred);
                          const nextRead = !selectedThread.messages.every((message) => message.read);
                          return (
                            <>
                        <button
                          onClick={() =>
                            void mutateThreadMessages(
                              selectedThread,
                              (message) => ({ ...message, starred: nextStarred }),
                              (message) => mailApi.updateMessage(message.id, { starred: nextStarred }),
                              'Conversation updated',
                              'Failed to update star state',
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                        >
                          <Star size={15} /> Star
                        </button>
                        <button
                          onClick={() =>
                            void mutateThreadMessages(
                              selectedThread,
                              (message) => ({ ...message, read: nextRead }),
                              (message) => mailApi.updateMessage(message.id, { read: nextRead }),
                              'Read state updated',
                              'Failed to update read state',
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                        >
                          <CheckCheck size={15} /> Read
                        </button>
                        <button
                          onClick={() => void moveThread(selectedThread, 'archive', 'Conversation archived')}
                          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
                        >
                          <Archive size={15} /> Archive
                        </button>
                        <button
                          onClick={() => void moveThread(selectedThread, 'trash', 'Conversation moved to trash')}
                          className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-100 transition hover:bg-rose-400/15"
                        >
                          <Trash2 size={15} /> Trash
                        </button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    <div className="mx-auto max-w-4xl space-y-4">
                      {selectedThread.messages.map((message) => (
                        <article
                          key={message.id}
                          className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl"
                        >
                          <div className="flex flex-col gap-4 border-b border-white/8 pb-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <p className="text-base font-medium text-white">
                                {message.from.name || message.from.address}
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                To {message.to.map((item) => item.address).join(', ')}
                              </p>
                            </div>
                            <div className="text-sm text-slate-400">
                              {new Date(message.date).toLocaleString()}
                            </div>
                          </div>
                          <div
                            className="mt-5 text-sm leading-7 text-slate-200"
                            dangerouslySetInnerHTML={{
                              __html: DOMPurify.sanitize(message.bodyHtml || `<pre>${message.bodyText}</pre>`),
                            }}
                          />
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-xl sm:px-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          setReplyToThreadId(selectedThread.id);
                          setComposeOpen(true);
                        }}
                        className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
                      >
                        Reply
                      </button>
                      <button
                        onClick={() => {
                          setForwardFromThreadId(selectedThread.id);
                          setComposeOpen(true);
                        }}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
                      >
                        Forward
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center px-6">
                  <div className="max-w-md rounded-[32px] border border-white/8 bg-white/[0.04] p-8 text-center backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Reading pane</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                      Select a conversation
                    </h2>
                    <p className="mt-3 text-sm text-slate-400">
                      Live mail from the backend will render here with optimistic actions and
                      instant sync.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </main>

          <ComposePanel />
          <SearchOverlay />
          <Toast
            message={toast.countdown ? `${toast.message} (${toast.countdown}s)` : toast.message}
            visible={toast.visible}
            onDismiss={toast.hide}
            action={toast.action ?? undefined}
            duration={toast.countdown ? 0 : undefined}
          />
        </div>
      </ErrorBoundary>
    </HaseenThemeProvider>
  );
}
