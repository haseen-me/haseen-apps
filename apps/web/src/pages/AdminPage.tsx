import { Shield, Users, Mail, HardDrive, Calendar } from 'lucide-react';

const cards = [
  { label: 'Users', value: '—', icon: <Users size={18} /> },
  { label: 'Mail Accounts', value: '—', icon: <Mail size={18} /> },
  { label: 'Drive Accounts', value: '—', icon: <HardDrive size={18} /> },
  { label: 'Calendar Accounts', value: '—', icon: <Calendar size={18} /> },
];

export function AdminPage() {
  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--hsn-cta-primary-default)',
            background: 'var(--hsn-brand-subtle)',
            border: '1px solid var(--hsn-brand-soft)',
            padding: '6px 10px',
            borderRadius: 999,
          }}
        >
          <Shield size={14} />
          Admin Console
        </span>
        <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', margin: '14px 0 8px', lineHeight: 1.2 }}>
          Haseen Admin Panel
        </h1>
        <p style={{ color: 'var(--hsn-text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 760 }}>
          This panel is ready at <code>/admin</code>. You are marked as admin/super-admin in database.
          Live operational widgets and role-aware controls can be expanded next.
        </p>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginTop: 28,
        }}
      >
        {cards.map((card) => (
          <article
            key={card.label}
            style={{
              border: '1px solid var(--hsn-border-primary)',
              borderRadius: 12,
              background: 'var(--hsn-bg-app)',
              padding: 16,
            }}
          >
            <div style={{ color: 'var(--hsn-cta-primary-default)', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ color: 'var(--hsn-text-tertiary)', fontSize: 13 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>{card.value}</div>
          </article>
        ))}
      </section>

      <section
        style={{
          border: '1px solid var(--hsn-border-primary)',
          borderRadius: 12,
          background: 'var(--hsn-bg-app)',
          padding: 18,
          marginTop: 18,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Next steps</h2>
        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--hsn-text-secondary)', lineHeight: 1.8 }}>
          <li>Add server-side admin check middleware and token claims.</li>
          <li>Expose usage stats and account management actions.</li>
          <li>Add audit logs and admin activity history.</li>
        </ul>
      </section>
    </main>
  );
}
