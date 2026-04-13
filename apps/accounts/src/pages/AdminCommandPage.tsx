import React, { useEffect, useMemo, useState } from 'react';
import { Shield, Search, RefreshCw } from 'lucide-react';
import { SettingsLayout } from '@/layout/SettingsLayout';
import { InputField, Input, InputType, Banner, Button, Tabs, Surface, Typography, TypographySize, TypographyWeight, MonoTag, Skeleton, Type, Size } from '@haseen-me/ui';
import type { Tab } from '@haseen-me/ui';
import { authApi } from '@/api/auth';
import { useToastStore } from '@haseen-me/shared/toast';

type AdminTab = 'users' | 'domains' | 'health' | 'audit';

export function AdminCommandPage() {
  const toast = useToastStore();
  const [tab, setTab] = useState<AdminTab>('users');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [editingQuotas, setEditingQuotas] = useState<Record<string, { mail: string; drive: string }>>({});

  const tabItems: Tab[] = useMemo(() => [
    { id: 'users', label: 'Users' },
    { id: 'domains', label: 'Domains' },
    { id: 'health', label: 'Health' },
    { id: 'audit', label: 'Audit' },
  ], []);

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
      [u.id]: { mail: String(u.mailQuotaBytes ?? 0), drive: String(u.driveQuotaBytes ?? 0) },
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
    setEditingQuotas((prev) => { const next = { ...prev }; delete next[u.id]; return next; });
  };

  return (
    <SettingsLayout activeTab="/admin">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Shield size={18} style={{ color: 'var(--hsn-accent-teal)' }} />
        <Typography size={TypographySize.H3} weight={TypographyWeight.SEMIBOLD}>Super Admin</Typography>
      </div>
      <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-secondary)', marginBottom: 24 }}>
        High-trust controls. Actions are audited and sessions are enforced through secure cookies.
      </Typography>

      {err && <Banner color="error" style={{ marginBottom: 16, borderRadius: 8 }}>{err}</Banner>}

      <div style={{ marginBottom: 20 }}>
        <Tabs
          tabs={tabItems}
          activeTab={tab}
          onTabChange={(t) => setTab(t as AdminTab)}
        />
      </div>

      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', gap: 8, maxWidth: 420, marginBottom: 16, alignItems: 'flex-end' }}>
            <InputField label="Search" style={{ flex: 1 }}>
              <Input
                type={InputType.SEARCH}
                placeholder="email or display name"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                startIcon={<Search size={16} />}
              />
            </InputField>
            <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={load} loading={loading} startIcon={<RefreshCw size={14} />}>
              Refresh
            </Button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 80, borderRadius: 8 }} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {users.map((u) => (
                <Surface key={u.id} level="l1" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {u.email}
                    </Typography>
                    <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 2 }}>
                      {u.displayName || '—'} · sessions: {u.sessionCount ?? 0} · MFA: {u.mfaEnabled ? 'on' : 'off'} · verified: {u.emailVerified ? 'yes' : 'no'}
                    </Typography>
                    <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 2 }}>
                      mail: <MonoTag>{String(u.mailQuotaBytes ?? 0)}</MonoTag> · drive: <MonoTag>{String(u.driveQuotaBytes ?? 0)}</MonoTag>
                    </Typography>
                    {editingQuotas[u.id] && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        <InputField label="Mail quota (bytes)" style={{ minWidth: 200 }}>
                          <Input
                            type={InputType.TEXT}
                            placeholder="e.g. 5368709120"
                            value={editingQuotas[u.id]?.mail ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingQuotas((prev) => ({ ...prev, [u.id]: { mail: e.target.value, drive: prev[u.id]?.drive ?? '' } }))}
                          />
                        </InputField>
                        <InputField label="Drive quota (bytes)" style={{ minWidth: 200 }}>
                          <Input
                            type={InputType.TEXT}
                            placeholder="e.g. 10737418240"
                            value={editingQuotas[u.id]?.drive ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingQuotas((prev) => ({ ...prev, [u.id]: { mail: prev[u.id]?.mail ?? '', drive: e.target.value } }))}
                          />
                        </InputField>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                          <Button type={Type.PRIMARY} size={Size.SMALL} onClick={() => saveQuotas(u)}>Save</Button>
                          <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => setEditingQuotas((prev) => { const n = { ...prev }; delete n[u.id]; return n; })}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => openQuotaEditor(u)}>Edit quotas</Button>
                    <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => action(() => authApi.adminVerifyEmail(u.id), 'Account verified')}>Verify</Button>
                    <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => action(() => authApi.adminMfaEnforce(u.id, true), 'MFA enforced')}>Enforce MFA</Button>
                    <Button type={Type.DESTRUCTIVE} size={Size.SMALL} onClick={() => action(() => authApi.adminSuspend(u.id), 'User suspended')}>Suspend</Button>
                    <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => action(() => authApi.adminReactivate(u.id), 'User reactivated')}>Reactivate</Button>
                  </div>
                </Surface>
              ))}
              {users.length === 0 && (
                <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-tertiary)' }}>No users found.</Typography>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'domains' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={load} loading={loading} startIcon={<RefreshCw size={14} />}>Refresh</Button>
          </div>
          {domains.map((d) => (
            <Surface key={d.id} level="l1" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>{d.domain}</Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 2 }}>
                  MX:{String(d.mxVerified)} SPF:{String(d.spfVerified)} DKIM:{String(d.dkimVerified)} DMARC:{String(d.dmarcVerified)} · {d.status}
                </Typography>
              </div>
              <Button type={Type.SECONDARY} size={Size.SMALL} onClick={() => action(() => authApi.adminDomainOverride(d.id), 'Domain forced to verified')}>
                Verify override
              </Button>
            </Surface>
          ))}
          {domains.length === 0 && !loading && (
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-tertiary)' }}>No domains found.</Typography>
          )}
        </div>
      )}

      {tab === 'health' && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={load} loading={loading} startIcon={<RefreshCw size={14} />}>Refresh</Button>
          </div>
          <Surface level="l0" style={{ padding: 16 }}>
            <pre style={{ overflow: 'auto', fontSize: 12, margin: 0, fontFamily: 'monospace', color: 'var(--hsn-text-primary)' }}>
              {JSON.stringify(health, null, 2)}
            </pre>
          </Surface>
        </div>
      )}

      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ marginBottom: 8 }}>
            <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={load} loading={loading} startIcon={<RefreshCw size={14} />}>Refresh</Button>
          </div>
          {audit.map((e) => (
            <Surface key={e.id} level="l1" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>{e.action}</Typography>
                <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)' }}>
                  {new Date(e.createdAt).toLocaleString()}
                </Typography>
              </div>
              <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-tertiary)', marginTop: 4 }}>
                {e.targetType}:{e.targetId} · actor: {e.actorId ?? 'system'} · ip: {e.ipAddress || '—'}
              </Typography>
            </Surface>
          ))}
          {audit.length === 0 && !loading && (
            <Typography size={TypographySize.BODY} style={{ color: 'var(--hsn-text-tertiary)' }}>No audit events found.</Typography>
          )}
        </div>
      )}
    </SettingsLayout>
  );
}
