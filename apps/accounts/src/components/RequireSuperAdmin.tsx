import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user, hydrated } = useAuthStore();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--acc-text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  if (!user.isSuperAdmin) {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}

