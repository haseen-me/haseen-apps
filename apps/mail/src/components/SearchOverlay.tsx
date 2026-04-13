import { useState, useRef, useEffect } from 'react';
import { useMailStore } from '@/store/mail';
import { mailApi } from '@/api/client';
import { Search, X, Mail, ArrowRight, Filter, Paperclip } from 'lucide-react';
import { Dialog, Input, InputType, IconButton, Button, KeyCodeSequence, Typography, TypographySize, Type, Size } from '@haseen-me/ui';
import type { Thread } from '@/types/mail';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, threads, setActiveThreadId, setActiveLabel } = useMailStore();
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
      filtered = filtered.filter((t) => t.from.address.toLowerCase().includes(f) || (t.from.name && t.from.name.toLowerCase().includes(f)));
    }
    if (filterHasAttachment) filtered = filtered.filter((t) => t.hasAttachments);
    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      filtered = filtered.filter((t) => new Date(t.lastMessageDate).getTime() >= from);
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86400000;
      filtered = filtered.filter((t) => new Date(t.lastMessageDate).getTime() <= to);
    }
    if (filterLabel) filtered = filtered.filter((t) => t.labels.includes(filterLabel));
    return filtered;
  };

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
    }
  }, [searchOpen]);

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
          setResults(applyClientFilters(threads));
        }
      } catch {
        const lowerQ = query.toLowerCase();
        let filtered = threads;
        if (lowerQ) {
          filtered = filtered.filter((t: Thread) =>
            t.subject.toLowerCase().includes(lowerQ) || t.snippet.toLowerCase().includes(lowerQ) ||
            t.from.address.toLowerCase().includes(lowerQ) || (t.from.name && t.from.name.toLowerCase().includes(lowerQ)),
          );
        }
        setResults(applyClientFilters(filtered));
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, threads, filterFrom, filterHasAttachment, filterDateFrom, filterDateTo, filterLabel]);

  const handleSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    setSearchOpen(false);
    const thread = threads.find((t: Thread) => t.id === threadId);
    if (thread?.labels.length) {
      const primary = thread.labels[0];
      if (['inbox', 'sent', 'drafts', 'archive', 'spam', 'trash', 'starred'].includes(primary)) {
        setActiveLabel(primary as any);
      }
    }
  };

  return (
    <Dialog
      open={searchOpen}
      onClose={() => setSearchOpen(false)}
      style={{ maxWidth: 560, padding: 0, overflow: 'hidden' }}
    >
      {/* Search input row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--hsn-border-primary)' }}>
        <Search size={18} style={{ color: 'var(--hsn-icon-secondary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          placeholder="Search messages…"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: 15,
            background: 'transparent',
            color: 'var(--hsn-text-primary)',
            fontFamily: 'inherit',
          }}
        />
        <Button
          type={hasActiveFilters ? Type.SECONDARY : Type.TERTIARY}
          size={Size.SMALL}
          onClick={() => setShowFilters(!showFilters)}
          startIcon={<Filter size={12} />}
        >
          Filters{hasActiveFilters ? ' •' : ''}
        </Button>
        <KeyCodeSequence keys={['Esc']} />
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--hsn-border-primary)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', background: 'var(--hsn-bg-l0-solid)' }}>
          <Input type={InputType.TEXT} value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} placeholder="From…" style={{ width: 120 }} />
          <Button
            type={filterHasAttachment ? Type.SECONDARY : Type.TERTIARY}
            size={Size.SMALL}
            onClick={() => setFilterHasAttachment(!filterHasAttachment)}
            startIcon={<Paperclip size={11} />}
          >
            Attachment
          </Button>
          <Input type={InputType.TEXT} value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} placeholder="From date" style={{ width: 110 }} />
          <span style={{ fontSize: 11, color: 'var(--hsn-text-tertiary)' }}>–</span>
          <Input type={InputType.TEXT} value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} placeholder="To date" style={{ width: 110 }} />
          {hasActiveFilters && (
            <Button type={Type.TERTIARY} size={Size.SMALL} onClick={() => { setFilterFrom(''); setFilterHasAttachment(false); setFilterDateFrom(''); setFilterDateTo(''); setFilterLabel(''); }}>
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      <div style={{ maxHeight: 360, overflow: 'auto' }}>
        {(query.trim() || hasActiveFilters) && !searching && results.length === 0 && (
          <Typography size={TypographySize.BODY} style={{ padding: 32, textAlign: 'center', color: 'var(--hsn-text-tertiary)' }}>
            No results{query.trim() ? ` for "${query}"` : ' matching filters'}
          </Typography>
        )}
        {results.map((thread) => (
          <div
            key={thread.id}
            onClick={() => handleSelect(thread.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--hsn-border-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--hsn-bg-cell)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Mail size={16} style={{ color: 'var(--hsn-icon-secondary)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography size={TypographySize.BODY} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
                {thread.subject}
              </Typography>
              <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {thread.from.name || thread.from.address} · {thread.snippet}
              </Typography>
            </div>
            <ArrowRight size={14} style={{ color: 'var(--hsn-icon-secondary)', flexShrink: 0 }} />
          </div>
        ))}
        {!query.trim() && !hasActiveFilters && (
          <Typography size={TypographySize.BODY} style={{ padding: 32, textAlign: 'center', color: 'var(--hsn-text-tertiary)' }}>
            Type to search your messages
          </Typography>
        )}
      </div>
    </Dialog>
  );
}
