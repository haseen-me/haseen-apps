import { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';
import type { AdminAuditEvent } from '@haseen-me/api-client';
import { adminApi } from '@/api/client';
import { formatDate } from '@/lib/format';

export function AuditPage() {
  const [events, setEvents] = useState<AdminAuditEvent[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const response = await adminApi.audit(50);
      if (active) setEvents(response.events);
    };
    void load();
    const timer = window.setInterval(load, 20000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Audit</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          Operator activity log
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-400">
          Recent privileged actions captured by the auth service audit trail.
        </p>
      </section>

      <section className="space-y-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-lg font-medium text-white">{event.action}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {event.targetType}:{event.targetId}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <Clock3 size={13} /> {formatDate(event.createdAt)}
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-400">
              Actor: {event.actorId ?? 'system'} • IP: {event.ipAddress || 'n/a'}
            </div>
          </article>
        ))}
        {!events.length ? (
          <p className="text-sm text-slate-400">No audit events recorded yet.</p>
        ) : null}
      </section>
    </div>
  );
}
