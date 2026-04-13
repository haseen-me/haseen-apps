import { useEffect, useMemo, useState } from 'react';
import { Shield, Users, Search, Activity, Globe, FileText } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { Button, FormField, Alert } from '@/components/FormUI';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

type Tab = 'users' | 'domains' | 'health' | 'audit';

export function AdminCommandPage() {
  const toast = useToastStore();
  const [tab, setTab] = useState<Tab>('users');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [editingQuotas, setEditingQuotas] = useState<Record<string, { mail: string; drive: string }>>({});

  const tabs = useMemo(
    () => [
      { key: 'users' as const, label: 'Users', icon: <Users size={16} /> },
      { key: 'domains' as const, label: 'Domains', icon: <Globe size={16} /> },
      { key: 'health' as const, label: 'Health', icon: <Activity size={16} /> },
      { key: 'audit' as const, label: 'Audit', icon: <FileText size={16} /> },
    ],
    [],
  );

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      if (tab === 'users') {
        const res = await authApi.adminUsers({ q: q.trim() || undefined });
        setUsers(res.users || []);
      } else if (tab === 'domains') {
        const res = await authApi.adminDomains();
        setDomains(res.domains || []);
      } else if (tab === 'audit') {
        const res = await authApi.adminAudit();
        setAudit(res.events || []);
      } else {
        const [overview, smtp, attach, pool, lat] = await Promise.all([
          authApi.adminOverview(),
          authApi.adminSmtpQueue(),
          authApi.adminAttachments(),
          authApi.adminPool(),
          authApi.adminLatency(),
        ]);
        setHealth({ overview, smtp, attachments: attach, pool, latency: lat });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab]);

  const action = async (fn: () => Promise<any>, msg: string) => {
    try {
      await fn();
      toast.show(msg, { countdown: 4 });
      await load();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Action failed', { countdown: 6 });
    }
  };

  const openQuotaEditor = (u: any) => {
    setEditingQuotas((prev) => ({
      ...prev,
      [u.id]: {
        mail: String(u.mailQuotaBytes ?? 0),
        drive: String(u.driveQuotaBytes ?? 0),
      },
    }));
  };

  const saveQuotas = async (u: any) => {
    const v = editingQuotas[u.id];
    if (!v) return;
    const mail = Number(v.mail);
    const drive = Number(v.drive);
    if (!Number.isFinite(mail) || !Number.isFinite(drive) || mail < 0 || drive < 0) {
      toast.show('Quotas must be valid non-negative numbers (bytes).', { countdown: 6 });
      return;
    }
    await action(
      () => authApi.adminSetQuotas(u.id, { mailQuotaBytes: Math.trunc(mail), driveQuotaBytes: Math.trunc(drive) }),
      'Quotas updated',
    );
    setEditingQuotas((prev) => {
      const next = { ...prev };
      delete next[u.id];
      return next;
    });
  };

  return (
    <SettingsLayout activeTab="/admin">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Shield size={18} style={{ color: 'var(--acc-brand)' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Super Admin</h1>
      </div>
      <p style={{ fontSize: 14, color: 'var(--acc-text-secondary)', marginBottom: 24 }}>
        High-trust controls. Actions are audited and sessions are enforced through secure cookies.
      </p>

      {err && <Alert type="error">{err}</Alert>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'secondary'}
            onClick={() => setTab(t.key)}
          >
            {t.icon} {t.label}
          </Button>
        ))}
      </div>

      {tab === 'users' ? (
        <>
          <div style={{ maxWidth: 420, marginBottom: 12 }}>
            <FormField
              label="Search"
              placeholder="email or display name"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              icon={<Search size={16} />}
            />
            <Button variant="secondary" onClick={load} loading={loading}>
              Refresh
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map((u) => (
              <div
                key={u.id}
                style={{
                  padding: 16,
                  borderRadius: 'var(--acc-radius-sm)',
                  border: '1px solid var(--acc-border)',
                  background: 'var(--acc-bg-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--acc-text-muted)' }}>
                    {u.displayName || '—'} · sessions: {u.sessionCount ?? 0} · MFA:{' '}
                    {u.mfaEnabled ? 'on' : 'off'} · verified: {u.emailVerified ? 'yes' : 'no'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--acc-text-muted)', marginTop: 4 }}>
                    mail quota: {String(u.mailQuotaBytes ?? 0)} bytes · drive quota: {String(u.driveQuotaBytes ?? 0)} bytes
                  </div>
                  {editingQuotas[u.id] ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 220 }}>
                        <FormField
                          label="Mail quota (bytes)"
                          placeholder="e.g. 5368709120"
                          value={editingQuotas[u.id]?.mail ?? ''}
                          onChange={(e) =>
                            setEditingQuotas((prev) => ({
                              ...prev,
                              [u.id]: { mail: e.target.value, drive: prev[u.id]?.drive ?? '' },
                            }))
                          }
                        />
                      </div>
                      <div style={{ minWidth: 220 }}>
                        <FormField
                          label="Drive quota (bytes)"
                          placeholder="e.g. 10737418240"
                          value={editingQuotas[u.id]?.drive ?? ''}
                          onChange={(e) =>
                            setEditingQuotas((prev) => ({
                              ...prev,
                              [u.id]: { mail: prev[u.id]?.mail ?? '', drive: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <Button variant="secondary" onClick={() => saveQuotas(u)}>
                          Save quotas
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setEditingQuotas((prev) => {
                              const next = { ...prev };
                              delete next[u.id];
                              return next;
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => openQuotaEditor(u)}>
                    Edit quotas
                  </Button>
                  <Button variant="secondary" onClick={() => action(() => authApi.adminVerifyEmail(u.id), 'Account verified')}>
                    Verify
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => action(() => authApi.adminMfaEnforce(u.id, true), 'MFA enforced')}
                  >
                    Enforce MFA
                  </Button>
                  <Button variant="danger" onClick={() => action(() => authApi.adminSuspend(u.id), 'User suspended')}>
                    Suspend
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => action(() => authApi.adminReactivate(u.id), 'User reactivated')}
                  >
                    Reactivate
                  </Button>
                </div>
              </div>
            ))}
            {users.length === 0 && !loading ? (
              <p style={{ color: 'var(--acc-text-muted)' }}>No users found.</p>
            ) : null}
          </div>
        </>
      ) : null}

      {tab === 'domains' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" onClick={load} loading={loading}>
            Refresh
          </Button>
          {domains.map((d) => (
            <div
              key={d.id}
              style={{
                padding: 16,
                borderRadius: 'var(--acc-radius-sm)',
                border: '1px solid var(--acc-border)',
                background: 'var(--acc-bg-card)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{d.domain}</div>
                <div style={{ fontSize: 12, color: 'var(--acc-text-muted)' }}>
                  MX:{String(d.mxVerified)} SPF:{String(d.spfVerified)} DKIM:{String(d.dkimVerified)} DMARC:{String(d.dmarcVerified)} · status: {d.status}
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => action(() => authApi.adminDomainOverride(d.id), 'Domain forced to verified')}
              >
                Verify override
              </Button>
            </div>
          ))}
          {domains.length === 0 && !loading ? (
            <p style={{ color: 'var(--acc-text-muted)' }}>No domains found.</p>
          ) : null}
        </div>
      ) : null}

      {tab === 'health' ? (
        <div>
          <Button variant="secondary" onClick={load} loading={loading}>
            Refresh
          </Button>
          <pre
            style={{
              marginTop: 12,
              background: 'var(--acc-bg)',
              border: '1px solid var(--acc-border)',
              borderRadius: 'var(--acc-radius-sm)',
              padding: 16,
              overflow: 'auto',
              fontSize: 12,
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      ) : null}

      {tab === 'audit' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" onClick={load} loading={loading}>
            Refresh
          </Button>
          {audit.map((e) => (
            <div
              key={e.id}
              style={{
                padding: 14,
                borderRadius: 'var(--acc-radius-sm)',
                border: '1px solid var(--acc-border)',
                background: 'var(--acc-bg-card)',
                fontSize: 13,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong>{e.action}</strong>
                <span style={{ color: 'var(--acc-text-muted)' }}>{new Date(e.createdAt).toLocaleString()}</span>
              </div>
              <div style={{ color: 'var(--acc-text-muted)', marginTop: 4 }}>
                {e.targetType}:{e.targetId} · actor: {e.actorId ?? 'system'} · ip: {e.ipAddress || '—'}
              </div>
            </div>
          ))}
          {audit.length === 0 && !loading ? (
            <p style={{ color: 'var(--acc-text-muted)' }}>No audit events found.</p>
          ) : null}
        </div>
      ) : null}
    </SettingsLayout>
  );
}

