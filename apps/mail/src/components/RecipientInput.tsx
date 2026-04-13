import { useState, useRef, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { contactsApi } from '@/api/client';

interface Recipient {
  address: string;
  name?: string;
}

interface RecipientInputProps {
  label: string;
  recipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  rightAction?: React.ReactNode;
}

export function RecipientInput({ label, recipients, onChange, rightAction }: RecipientInputProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ email: string; name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const searchContacts = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    try {
      const result = await contactsApi.searchContacts(q);
      const existing = new Set(recipients.map((r) => r.address));
      setSuggestions(
        result.contacts
          .filter((c) => !existing.has(c.email))
          .slice(0, 6)
          .map((c) => ({ email: c.email, name: c.name })),
      );
    } catch {
      setSuggestions([]);
    }
  }, [recipients]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchContacts(query.trim());
      setShowSuggestions(true);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [query, searchContacts]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addRecipient = (addr: string, name?: string) => {
    const trimmed = addr.trim();
    if (!trimmed) return;
    if (recipients.some((r) => r.address === trimmed)) return;
    onChange([...recipients, { address: trimmed, name }]);
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const removeRecipient = (index: number) => {
    onChange(recipients.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        addRecipient(suggestions[activeIndex].email, suggestions[activeIndex].name);
      } else if (query.trim()) {
        addRecipient(query);
      }
    } else if (e.key === 'Backspace' && !query && recipients.length > 0) {
      removeRecipient(recipients.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 0',
          borderBottom: '1px solid var(--hsn-border-primary)',
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            fontSize: 13,
            color: 'var(--hsn-text-tertiary)',
            width: 56,
            flexShrink: 0,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
        {recipients.map((r, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              padding: '2px 6px',
              borderRadius: 12,
              background: 'var(--hsn-bg-cell)',
              fontSize: 12,
              color: 'var(--hsn-text-primary)',
              maxWidth: 200,
              overflow: 'hidden',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.name || r.address}
            </span>
            <button
              onClick={() => removeRecipient(i)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--hsn-text-tertiary)',
                display: 'flex',
                flexShrink: 0,
              }}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          placeholder={recipients.length === 0 ? 'Type email or name...' : ''}
          style={{
            flex: 1,
            minWidth: 100,
            border: 'none',
            outline: 'none',
            fontSize: 14,
            background: 'transparent',
            color: 'var(--hsn-text-primary)',
            fontFamily: 'inherit',
            padding: '2px 0',
          }}
        />
        {rightAction}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 56,
            right: 0,
            background: 'var(--hsn-bg-l1-solid)',
            border: '1px solid var(--hsn-border-primary)',
            borderRadius: '8px',
            boxShadow: 'var(--hsn-shadow-l3)',
            zIndex: 200,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={s.email}
              onClick={() => addRecipient(s.email, s.name)}
              onMouseEnter={() => setActiveIndex(i)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: i === activeIndex ? 'var(--hsn-bg-cell)' : 'transparent',
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 500, color: 'var(--hsn-text-primary)' }}>{s.name}</div>
              <div style={{ fontSize: 12, color: 'var(--hsn-text-tertiary)' }}>{s.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
