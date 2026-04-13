import { useMemo, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, ChevronLeft, ChevronRight, FileClock, Globe2, Users } from 'lucide-react';
import { ErrorBoundary } from '@haseen-me/shared/ErrorBoundary';
import { OverviewPage } from '@/pages/OverviewPage';
import { DomainsPage } from '@/pages/DomainsPage';
import { UsersPage } from '@/pages/UsersPage';
import { AuditPage } from '@/pages/AuditPage';

type NavItem = {
  label: string;
  to: string;
  icon: typeof BarChart3;
  description: string;
};

const navItems: NavItem[] = [
  { label: 'Overview', to: '/', icon: BarChart3, description: 'Bento analytics and platform health' },
  { label: 'Domains', to: '/domains', icon: Globe2, description: 'DNS records and mailbox routing' },
  { label: 'Users', to: '/users', icon: Users, description: 'Identity, quotas, and access posture' },
  { label: 'Audit', to: '/audit', icon: FileClock, description: 'Privileged action history' },
];

function ConsoleLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const activeItem = useMemo(
    () =>
      navItems.find((item) =>
        item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to),
      ),
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_32%),linear-gradient(180deg,#060816_0%,#070b17_40%,#030511_100%)] text-white">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 p-4 sm:p-6">
        <motion.aside
          animate={{ width: collapsed ? 104 : 296 }}
          transition={{ type: 'spring', stiffness: 250, damping: 28 }}
          className="hidden shrink-0 overflow-hidden rounded-[32px] border border-white/8 bg-slate-950/55 p-4 backdrop-blur-xl lg:block"
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">Haseen</p>
                {!collapsed ? (
                  <p className="mt-1 truncate text-lg font-semibold tracking-[-0.04em] text-white">
                    Console
                  </p>
                ) : null}
              </div>
              <button
                onClick={() => setCollapsed((value) => !value)}
                className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>

            <nav className="mt-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-[24px] border px-3 py-3 transition ${
                        isActive
                          ? 'border-cyan-300/40 bg-cyan-300/10 text-white'
                          : 'border-transparent bg-transparent text-slate-300 hover:border-white/8 hover:bg-white/[0.04]'
                      }`
                    }
                  >
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-cyan-200">
                      <Icon size={17} />
                    </div>
                    {!collapsed ? (
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.label}</p>
                        <p className="truncate text-xs text-slate-500">{item.description}</p>
                      </div>
                    ) : null}
                  </NavLink>
                );
              })}
            </nav>

            {!collapsed ? (
              <div className="mt-auto rounded-[28px] border border-white/8 bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current surface</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">
                  {activeItem?.label ?? 'Overview'}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Premium control plane for operator workflows, DNS setup, and realtime platform
                  telemetry.
                </p>
              </div>
            ) : null}
          </div>
        </motion.aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-[32px] border border-white/8 bg-black/20 p-4 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-2 text-sm ${
                      isActive ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-slate-200'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <Routes>
                  <Route path="/" element={<OverviewPage />} />
                  <Route path="/domains" element={<DomainsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/audit" element={<AuditPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/console">
        <ConsoleLayout />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
