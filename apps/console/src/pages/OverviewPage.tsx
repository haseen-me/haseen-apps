import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Database,
  HardDrive,
  Mail,
  Server,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type {
  AdminLatencyMetrics,
  AdminOverviewMetrics,
  AdminPoolMetrics,
  AdminSmtpQueueMetrics,
} from '@haseen-me/api-client';
import { adminApi } from '@/api/client';
import { formatBytes, formatCompact } from '@/lib/format';

type GatewayHealth = {
  status: string;
  services: Record<string, string>;
};

async function getGatewayHealth(): Promise<GatewayHealth> {
  const response = await fetch('/api/health', { credentials: 'include' });
  if (!response.ok) {
    throw new Error('Failed to fetch gateway health');
  }
  return response.json() as Promise<GatewayHealth>;
}

export function OverviewPage() {
  const [overview, setOverview] = useState<AdminOverviewMetrics | null>(null);
  const [smtp, setSmtp] = useState<AdminSmtpQueueMetrics | null>(null);
  const [latency, setLatency] = useState<AdminLatencyMetrics | null>(null);
  const [pool, setPool] = useState<AdminPoolMetrics | null>(null);
  const [health, setHealth] = useState<GatewayHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [overviewRes, smtpRes, latencyRes, poolRes, healthRes] = await Promise.all([
          adminApi.overview(),
          adminApi.smtpQueue(),
          adminApi.latency(),
          adminApi.pool(),
          getGatewayHealth(),
        ]);
        if (!active) return;
        setOverview(overviewRes);
        setSmtp(smtpRes);
        setLatency(latencyRes);
        setPool(poolRes);
        setHealth(healthRes);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      }
    };
    void load();
    const timer = window.setInterval(load, 15000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Total users',
        value: formatCompact(overview?.activeSessions ?? 0),
        detail: 'Live authenticated sessions',
        icon: Users,
      },
      {
        title: 'Active domains',
        value: formatCompact(
          Object.values(health?.services ?? {}).filter((value) => value === 'ok').length,
        ),
        detail: 'Operational services reporting healthy',
        icon: ShieldCheck,
      },
      {
        title: 'Storage used',
        value: formatBytes(overview?.drive.usedBytes ?? 0),
        detail: 'Drive usage across the suite',
        icon: HardDrive,
      },
      {
        title: 'Server health',
        value: health?.status === 'ok' ? 'Healthy' : 'Degraded',
        detail: 'Gateway aggregated service status',
        icon: Server,
      },
    ],
    [health, overview],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(3,8,24,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/70">Mission control</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Realtime command surface for Haseen.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300">
              Observe platform health, queue pressure, storage growth, and DNS readiness in a
              single dark-first operator view.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-left text-xs text-slate-300 sm:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-slate-400">Outbound queue</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {formatCompact(smtp?.pendingDelivery ?? 0)}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <div className="text-slate-400">Auth DB latency</div>
              <div className="mt-1 text-lg font-semibold text-white">
                {latency?.authDbPingMs ?? 0} ms
              </div>
            </div>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const span =
            index === 0 ? 'xl:col-span-5' : index === 1 ? 'xl:col-span-3' : 'xl:col-span-2';
          return (
            <article
              key={card.title}
              className={`rounded-[24px] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-xl ${span}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{card.title}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">{card.detail}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-cyan-400/10 p-3 text-cyan-200">
                  <Icon size={18} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <article className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5 xl:col-span-7">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <Mail size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Queue pressure</h2>
              <p className="text-sm text-slate-400">
                Live outbound mail throughput from the auth metrics surface.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {[
              ['Queued', smtp?.queued ?? 0],
              ['Sending', smtp?.sending ?? 0],
              ['Delivered', smtp?.delivered ?? 0],
              ['Bounced', smtp?.bounced ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatCompact(Number(value))}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5 xl:col-span-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Database pool</h2>
              <p className="text-sm text-slate-400">
                Acquired, idle, and max pool capacity from the auth store.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              ['Acquired', pool?.dbPoolAcquired ?? 0],
              ['Idle', pool?.dbPoolIdle ?? 0],
              ['Max', pool?.dbPoolMax ?? 0],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-sm text-slate-400">{label}</span>
                <span className="text-sm font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Service matrix</h2>
              <p className="text-sm text-slate-400">
                Gateway aggregated health across upstream services.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(health?.services ?? {}).map(([name, status]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <span className="capitalize text-sm text-slate-300">{name}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    status === 'ok'
                      ? 'bg-emerald-400/15 text-emerald-200'
                      : 'bg-amber-400/15 text-amber-200'
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Storage composition</h2>
              <p className="text-sm text-slate-400">
                Inline and R2-backed attachment growth from realtime metrics.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>Drive usage</span>
              <span className="font-medium text-white">
                {formatBytes(overview?.drive.usedBytes ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>Inline attachments</span>
              <span className="font-medium text-white">
                {formatBytes(overview?.attachments.inlineBytes ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>R2-backed attachments</span>
              <span className="font-medium text-white">
                {formatBytes(overview?.attachments.r2RefBytes ?? 0)}
              </span>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
