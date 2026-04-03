import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { Search, X, Mail, ArrowRight } from 'lucide-react';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, setSearchQuery, threads, setActiveThreadId, setActiveLabel } =
    useMailStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const lowerQ = query.toLowerCase();
  const results = query.trim()
    ? threads.filter(
        (t) =>
          t.subject.toLowerCase().includes(lowerQ) ||
          t.snippet.toLowerCase().includes(lowerQ) ||
          t.from.address.toLowerCase().includes(lowerQ) ||
          (t.from.name && t.from.name.toLowerCase().includes(lowerQ))
      )
    : [];

  const handleSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setSearchOpen(false);
    // Switch to the label where the thread lives
    const thread = threads.find((t) => t.id === threadId);
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
          maxHeight: 420,
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

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {query.trim() && results.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: 'center',
                color: 'var(--mail-text-muted)',
                fontSize: 14,
              }}
            >
              No results for "{query}"
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
          {!query.trim() && (
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
