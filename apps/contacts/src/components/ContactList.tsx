import { useContactsStore } from '@/store/contacts';

export function ContactList() {
  const { contacts, searchQuery, selectedContactId, setSelectedContactId, loading } = useContactsStore();

  const filtered = contacts
    .filter((c) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));

  if (loading) {
    return (
      <div style={{ padding: 8 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
              borderBottom: '1px solid var(--ct-border-subtle)',
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--ct-bg-hover)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: 120, height: 13, borderRadius: 4, background: 'var(--ct-bg-hover)', animation: 'skeletonPulse 1.5s ease-in-out infinite', marginBottom: 4 }} />
              <div style={{ width: 180, height: 11, borderRadius: 4, background: 'var(--ct-bg-hover)', animation: 'skeletonPulse 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'var(--ct-text-muted)', fontSize: 13 }}>
        {searchQuery ? 'No contacts match your search' : 'No contacts yet. Click "New contact" to add one.'}
      </div>
    );
  }

  // Group by first letter
  const groups: Map<string, typeof filtered> = new Map();
  for (const c of filtered) {
    const letter = (c.name || c.email)[0]?.toUpperCase() ?? '#';
    const group = groups.get(letter) ?? [];
    group.push(c);
    groups.set(letter, group);
  }

  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      {[...groups.entries()].map(([letter, items]) => (
        <div key={letter}>
          <div
            style={{
              padding: '6px 16px', fontSize: 11, fontWeight: 600, color: 'var(--ct-brand)',
              background: 'var(--ct-bg-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em',
              position: 'sticky', top: 0, zIndex: 1,
            }}
          >
            {letter}
          </div>
          {items.map((c) => {
            const isActive = c.id === selectedContactId;
            const initial = c.name
              ? c.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
              : c.email[0]?.toUpperCase() ?? '?';
            return (
              <div
                key={c.id}
                onClick={() => setSelectedContactId(c.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', cursor: 'pointer', transition: 'background 0.1s',
                  background: isActive ? 'var(--ct-brand-subtle)' : 'var(--ct-bg)',
                  borderBottom: '1px solid var(--ct-border-subtle)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--ct-bg-hover)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--ct-bg)'; }}
              >
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: isActive ? 'var(--ct-brand)' : 'var(--ct-bg-active)',
                    color: isActive ? '#fff' : 'var(--ct-text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600, flexShrink: 0,
                  }}
                >
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.name || c.email}
                  </div>
                  {c.name && (
                    <div style={{ fontSize: 12, color: 'var(--ct-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.email}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
