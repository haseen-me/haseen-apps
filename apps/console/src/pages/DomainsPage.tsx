import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Globe, Mailbox, Plus, RefreshCw, Trash2 } from 'lucide-react';
import type { CustomDomain, DNSCheckLog, DomainMailbox, DomainResponse } from '@haseen-me/api-client';
import { domainsApi } from '@/api/client';
import { formatDate } from '@/lib/format';

function copyValue(value: string) {
  return navigator.clipboard.writeText(value);
}

export function DomainsPage() {
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DomainResponse | null>(null);
  const [logs, setLogs] = useState<DNSCheckLog[]>([]);
  const [localPart, setLocalPart] = useState('ops');
  const [displayName, setDisplayName] = useState('Operations');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDomains = async (preferId?: string | null) => {
    setLoading(true);
    try {
      const items = await domainsApi.list();
      setDomains(items);
      const nextId = preferId ?? selectedId ?? items[0]?.id ?? null;
      setSelectedId(nextId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDomains();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setLogs([]);
      return;
    }
    let active = true;
    void Promise.all([domainsApi.get(selectedId), domainsApi.getDNSLogs(selectedId)])
      .then(([domainDetail, domainLogs]) => {
        if (!active) return;
        setDetail(domainDetail);
        setLogs(domainLogs);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load domain detail');
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const activeDomain = useMemo(
    () => domains.find((domain) => domain.id === selectedId) ?? null,
    [domains, selectedId],
  );

  const submitDomain = async () => {
    if (!newDomain.trim()) return;
    const response = await domainsApi.add(newDomain.trim());
    setNewDomain('');
    await loadDomains(response.domain.id);
  };

  const addMailbox = async () => {
    if (!selectedId || !localPart.trim()) return;
    const mailbox = await domainsApi.addMailbox(
      selectedId,
      localPart.trim(),
      displayName.trim(),
      false,
    );
    setDetail((current) =>
      current ? { ...current, mailboxes: [...current.mailboxes, mailbox] } : current,
    );
    setLocalPart('support');
    setDisplayName('Support');
  };

  const removeMailbox = async (mailbox: DomainMailbox) => {
    if (!selectedId) return;
    await domainsApi.deleteMailbox(selectedId, mailbox.id);
    setDetail((current) =>
      current
        ? { ...current, mailboxes: current.mailboxes.filter((item) => item.id !== mailbox.id) }
        : current,
    );
  };

  const refreshVerification = async () => {
    if (!selectedId) return;
    await domainsApi.verify(selectedId);
    const [domainDetail, domainLogs] = await Promise.all([
      domainsApi.get(selectedId),
      domainsApi.getDNSLogs(selectedId),
    ]);
    setDetail(domainDetail);
    setLogs(domainLogs);
    await loadDomains(selectedId);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <section className="rounded-[28px] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Domains</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
              DNS management
            </h1>
          </div>
          <button
            onClick={() => void loadDomains(selectedId)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            <RefreshCw size={15} className="inline-block" />
          </button>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/8 bg-slate-950/50 p-4">
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">Add domain</label>
          <div className="mt-3 flex gap-2">
            <input
              value={newDomain}
              onChange={(event) => setNewDomain(event.target.value)}
              placeholder="mail.example.com"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />
            <button
              onClick={() => void submitDomain()}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
            >
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {domains.map((domain) => (
            <button
              key={domain.id}
              onClick={() => setSelectedId(domain.id)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                selectedId === domain.id
                  ? 'border-cyan-300/60 bg-cyan-300/10'
                  : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{domain.domain}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Checked {formatDate(domain.lastCheckedAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    domain.status === 'verified'
                      ? 'bg-emerald-400/15 text-emerald-200'
                      : 'bg-amber-400/15 text-amber-200'
                  }`}
                >
                  {domain.status}
                </span>
              </div>
            </button>
          ))}
          {!domains.length && !loading ? (
            <p className="text-sm text-slate-400">No custom domains yet.</p>
          ) : null}
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
      </section>

      <section className="space-y-5">
        <article className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                <Globe size={14} /> {activeDomain?.domain ?? 'Select a domain'}
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                DNS record instructions
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Publish the exact records below, then trigger verification to update MX, SPF, DKIM,
                and DMARC status in realtime.
              </p>
            </div>
            <button
              onClick={() => void refreshVerification()}
              disabled={!selectedId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} /> Refresh verification
            </button>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {detail ? (
              Object.entries(detail.dnsRecords).map(([key, record]) => (
                <div
                  key={key}
                  className="rounded-[22px] border border-white/8 bg-slate-950/50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{key}</p>
                      <h3 className="mt-2 text-lg font-medium text-white">{record.type} record</h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        record.verified
                          ? 'bg-emerald-400/15 text-emerald-200'
                          : 'bg-amber-400/15 text-amber-200'
                      }`}
                    >
                      {record.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div>
                      <p className="text-slate-500">Host</p>
                      <div className="mt-1 flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white">
                        <span className="break-all">{record.host}</span>
                        <button
                          onClick={() => void copyValue(record.host)}
                          className="text-slate-400 transition hover:text-white"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500">Value</p>
                      <div className="mt-1 flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 font-mono text-xs text-white">
                        <span className="break-all">{record.value}</span>
                        <button
                          onClick={() => void copyValue(record.value)}
                          className="text-slate-400 transition hover:text-white"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm text-slate-400 xl:col-span-2">
                Select a domain to inspect its MX, SPF, DKIM, and DMARC records.
              </div>
            )}
          </div>
        </article>

        <div className="grid gap-5 xl:grid-cols-2">
          <article className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                <Mailbox size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Domain mailboxes</h2>
                <p className="text-sm text-slate-400">
                  Provision recipient aliases and ownership routing for inbound mail.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <input
                value={localPart}
                onChange={(event) => setLocalPart(event.target.value)}
                placeholder="support"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Support"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
            </div>
            <button
              onClick={() => void addMailbox()}
              disabled={!selectedId}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={15} /> Add mailbox
            </button>
            <div className="mt-5 space-y-3">
              {detail?.mailboxes.map((mailbox) => (
                <div
                  key={mailbox.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {mailbox.localPart}@{activeDomain?.domain}
                    </p>
                    <p className="text-xs text-slate-400">
                      {mailbox.displayName || 'No display name'}
                    </p>
                  </div>
                  <button
                    onClick={() => void removeMailbox(mailbox)}
                    className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-rose-400/10 hover:text-rose-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {!detail?.mailboxes.length ? (
                <p className="text-sm text-slate-400">
                  No mailboxes configured for this domain yet.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Verification timeline</h2>
                <p className="text-sm text-slate-400">
                  Most recent DNS checks and expected values from the mail service.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium capitalize text-white">{log.checkType}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        log.passed ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'
                      }`}
                    >
                      {log.passed ? 'Pass' : 'Mismatch'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Expected: {log.expectedValue || 'n/a'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Observed: {log.actualValue || 'n/a'}
                  </p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {formatDate(log.checkedAt)}
                  </p>
                </div>
              ))}
              {!logs.length ? (
                <p className="text-sm text-slate-400">
                  No verification checks have been recorded yet.
                </p>
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
