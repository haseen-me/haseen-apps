import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  displayName: string;
  mfaEnabled: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'haseen-auth';

function loadPersistedAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const data = JSON.parse(raw);
    return { user: data.user ?? null, token: data.token ?? null };
  } catch {
    return { user: null, token: null };
  }
}

function persistAuth(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  recoveryKey: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecoveryKey: (key: string | null) => void;
  loginSuccess: (user: User, token: string) => void;
  logout: () => void;
}

const persisted = loadPersistedAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: persisted.user,
  token: persisted.token,
  loading: false,
  error: null,
  recoveryKey: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setRecoveryKey: (recoveryKey) => set({ recoveryKey }),
  loginSuccess: (user, token) => {
    persistAuth(user, token);
    set({ user, token, error: null });
  },
  logout: () => {
    persistAuth(null, null);
    localStorage.removeItem('haseen-mail-keypairs');
    localStorage.removeItem('haseen-drive-keypairs');
    localStorage.removeItem('haseen-calendar-keypairs');
    localStorage.removeItem('haseen-encrypted-keys');
    set({ user: null, token: null, recoveryKey: null });
  },
}));
