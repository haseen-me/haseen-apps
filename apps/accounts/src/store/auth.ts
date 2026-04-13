import { create } from 'zustand';
import { authApi } from '@/api/auth';

export interface User {
  id: string;
  email: string;
  displayName: string;
  mfaEnabled: boolean;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  recoveryKey: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecoveryKey: (key: string | null) => void;
  setUser: (user: User | null) => void;
  fetchSession: () => Promise<void>;
  loginSuccess: (user: User) => void;
  logout: () => Promise<void>;
}

function mapUser(u: { id: string; email: string; displayName?: string; createdAt: string }, mfa?: boolean): User {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName ?? u.email.split('@')[0] ?? '',
    mfaEnabled: mfa ?? false,
    createdAt: u.createdAt,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  loading: false,
  error: null,
  recoveryKey: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setRecoveryKey: (recoveryKey) => set({ recoveryKey }),
  setUser: (user) => set({ user }),
  fetchSession: async () => {
    try {
      const acc = await authApi.getAccount();
      set({
        user: mapUser(acc.user, acc.mfaEnabled),
        hydrated: true,
        error: null,
      });
    } catch {
      set({ user: null, hydrated: true });
    }
  },
  loginSuccess: (user) => set({ user, error: null }),
  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('haseen-mail-keypairs');
      localStorage.removeItem('haseen-drive-keypairs');
      localStorage.removeItem('haseen-calendar-keypairs');
      localStorage.removeItem('haseen-encrypted-keys');
      set({ user: null, recoveryKey: null });
    }
  },
}));
