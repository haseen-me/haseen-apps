import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, hydrated, fetchSession } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!hydrated) void fetchSession();
  }, [hydrated, fetchSession]);

  if (!hydrated) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--hsn-text-tertiary)' }}>
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
