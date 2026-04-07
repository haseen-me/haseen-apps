import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { mailApi } from '@/api/client';
import { Search, X, Mail, ArrowRight, Filter, Paperclip, Calendar } from 'lucide-react';
import type { Thread } from '@/types/mail';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSearchQuery, threads, setActiveThreadId, setActiveLabel } =
    useMailStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Thread[]>([]);
  const [searching, setSearching] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterHasAttachment, setFilterHasAttachment] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hasActiveFilters = filterFrom || filterHasAttachment || filterDateFrom || filterDateTo || filterLabel;

  const applyClientFilters = (list: Thread[]): Thread[] => {
    let filtered = list;
    if (filterFrom) {
      const f = filterFrom.toLowerCase();
      filtered = filtered.filter(
        (t) => t.from.address.toLowerCase().includes(f) || (t.from.name && t.from.name.toLowerCase().includes(f)),
      );
    }
    if (filterHasAttachment) {
      filtered = filtered.filter((t) => t.hasAttachments);
    }
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      filtered = filtered.filter((t) => new Date(t.lastMessageDate).getTime() >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86400000; // end of day
      filtered = filtered.filter((t) => new Date(t.lastMessageDate).getTime() <= to);
    }
    if (filterLabel) {
      filtered = filtered.filter((t) => t.labels.includes(filterLabel));
    }
    return filtered;
  };

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  // Focus input when opened
  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setResults([]);
      setFilterFrom('');
      setFilterHasAttachment(false);
      setFilterDateFrom('');
      setFilterDateTo('');
      setFilterLabel('');
      setShowFilters(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Debounced search via API
  useEffect(() => {
    if (!query.trim() && !hasActiveFilters) {
      setResults([]);
      setSearching(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (query.trim()) {
          const data = await mailApi.search(query.trim());
          setResults(applyClientFilters(data.threads as Thread[]));
        } else {
          // Filters only, no query text — filter local threads
          setResults(applyClientFilters(threads));
        }
      } catch {
        // Backend unavailable — fall back to in-memory filter
        const lowerQ = query.toLowerCase();
        let filtered = threads;
        if (lowerQ) {
          filtered = filtered.filter(
            (t: Thread) =>
              t.subject.toLowerCase().includes(lowerQ) ||
              t.snippet.toLowerCase().includes(lowerQ) ||
              t.from.address.toLowerCase().includes(lowerQ) ||
              (t.from.name && t.from.name.toLowerCase().includes(lowerQ)),
          );
        }
        setResults(applyClientFilters(filtered));
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, threads, filterFrom, filterHasAttachment, filterDateFrom, filterDateTo, filterLabel]);

  if (!searchOpen) return null;

  const handleSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setSearchOpen(false);
    const thread = threads.find((t: Thread) => t.id === threadId);
    if (thread && thread.labels.length) {
      const primary = thread.labels[0];
      if (['inbox', 'sent', 'drafts', 'archive', 'spam', 'trash', 'starred'].includes(primary)) {
        setActiveLabel(primary as any);
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setSearchOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 200,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 560,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 520,
          background: 'var(--mail-bg)',
          borderRadius: 'var(--mail-radius)',
          boxShadow: 'var(--mail-shadow-lg)',
          border: '1px solid var(--mail-border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.12s ease',
        }}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderBottom: '1px solid var(--mail-border)',
          }}
        >
          <Search size={18} style={{ color: 'var(--mail-text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              background: 'transparent',
              color: 'var(--mail-text)',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              background: hasActiveFilters ? 'var(--mail-brand-subtle)' : 'none',
              border: hasActiveFilters ? '1px solid var(--mail-brand)' : '1px solid var(--mail-border)',
              color: hasActiveFilters ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
              padding: '3px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            <Filter size={12} />
            Filters
            {hasActiveFilters && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--mail-brand)',
                }}
              />
            )}
          </button>
          <kbd
            style={{
              fontSize: 11,
              color: 'var(--mail-text-muted)',
              background: 'var(--mail-bg-secondary)',
              padding: '2px 6px',
              borderRadius: 4,
              border: '1px solid var(--mail-border)',
            }}
          >
            esc
          </kbd>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            style={{
              padding: '8px 16px',
              borderBottom: '1px solid var(--mail-border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              alignItems: 'center',
              background: 'var(--mail-bg-secondary)',
            }}
          >
            <input
              type="text"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              placeholder="From..."
              style={{
                width: 120,
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--mail-border)',
                fontSize: 12,
                background: 'var(--mail-bg)',
                color: 'var(--mail-text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={() => setFilterHasAttachment(!filterHasAttachment)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 4,
                border: filterHasAttachment ? '1px solid var(--mail-brand)' : '1px solid var(--mail-border)',
                background: filterHasAttachment ? 'var(--mail-brand-subtle)' : 'var(--mail-bg)',
                color: filterHasAttachment ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <Paperclip size={11} />
              Attachment
            </button>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              style={{
                padding: '4px 6px',
                borderRadius: 4,
                border: '1px solid var(--mail-border)',
                fontSize: 12,
                background: 'var(--mail-bg)',
                color: 'var(--mail-text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title="From date"
            />
            <span style={{ fontSize: 11, color: 'var(--mail-text-muted)' }}>–</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              style={{
                padding: '4px 6px',
                borderRadius: 4,
                border: '1px solid var(--mail-border)',
                fontSize: 12,
                background: 'var(--mail-bg)',
                color: 'var(--mail-text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              title="To date"
            />
            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: '1px solid var(--mail-border)',
                fontSize: 12,
                background: 'var(--mail-bg)',
                color: 'var(--mail-text)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              <option value="">Any label</option>
              <option value="inbox">Inbox</option>
              <option value="sent">Sent</option>
              <option value="drafts">Drafts</option>
              <option value="starred">Starred</option>
              <option value="archive">Archive</option>
              <option value="spam">Spam</option>
              <option value="trash">Trash</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilterFrom('');
                  setFilterHasAttachment(false);
                  setFilterDateFrom('');
                  setFilterDateTo('');
                  setFilterLabel('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mail-text-muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: '4px 6px',
                  textDecoration: 'underline',
                }}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {(query.trim() || hasActiveFilters) && !searching && results.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--mail-text-muted)',
                fontSize: 14,
              }}
            >
              No results{query.trim() ? ` for "${query}"` : ' matching filters'}
            </div>
          )}
          {results.map((thread) => (
            <div
              key={thread.id}
              onClick={() => handleSelect(thread.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--mail-border-subtle)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mail-bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Mail size={16} style={{ color: 'var(--mail-text-muted)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {thread.subject}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--mail-text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {thread.from.name || thread.from.address} · {thread.snippet}
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--mail-text-muted)', flexShrink: 0 }} />
            </div>
          ))}
          {!query.trim() && !hasActiveFilters && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--mail-text-muted)',
                fontSize: 13,
              }}
            >
              Type to search your messages
            </div>
          )}
        </div>
      </div>
    </>
  );
}
