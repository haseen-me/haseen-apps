import { useEffect, useState } from 'react';
import { Shield, UserCog } from 'lucide-react';
import type { AdminUser } from '@haseen-me/api-client';
import { adminApi } from '@/api/client';
import { formatBytes, formatDate } from '@/lib/format';

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await adminApi.users({ q: query || undefined });
        if (!active) return;
        setUsers(response.users);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-white/8 bg-white/[0.04] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">Identity</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
              User directory
            </h1>
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email or display name"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50 lg:max-w-sm"
          />
        </div>
      </section>

      <section className="grid gap-4">
        {users.map((user) => (
          <article key={user.id} className="rounded-[24px] border border-white/8 bg-slate-950/40 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium text-white">{user.email}</h2>
                  {user.isSuperAdmin ? (
                    <span className="rounded-full bg-cyan-300/15 px-2.5 py-1 text-xs text-cyan-100">
                      Super admin
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-400">
                  {user.displayName || 'No display name'} • Created {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sessions</p>
                  <p className="mt-2 text-base font-medium text-white">{user.sessionCount}</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Mail quota</p>
                  <p className="mt-2 text-base font-medium text-white">
                    {formatBytes(user.mailQuotaBytes)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Drive quota</p>
                  <p className="mt-2 text-base font-medium text-white">
                    {formatBytes(user.driveQuotaBytes)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">MFA</p>
                  <p className="mt-2 text-base font-medium text-white">
                    {user.mfaEnabled ? 'Enabled' : 'Off'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Shield size={13} /> Email {user.emailVerified ? 'verified' : 'pending'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <UserCog size={13} /> MFA {user.mfaEnforced ? 'enforced' : 'optional'}
              </span>
            </div>
          </article>
        ))}
        {!users.length && !loading ? (
          <p className="text-sm text-slate-400">No users found.</p>
        ) : null}
      </section>
    </div>
  );
}
