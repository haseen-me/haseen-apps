import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  action?: { label: string; onClick: () => void } | null;
  countdown?: number;
  show: (message: string, opts?: { action?: { label: string; onClick: () => void }; countdown?: number }) => void;
  hide: () => void;
  setCountdown: (n: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  action: null,
  countdown: undefined,
  show: (message, opts) => set({
    message,
    visible: true,
    action: opts?.action ?? null,
    countdown: opts?.countdown,
  }),
  hide: () => set({ visible: false, action: null, countdown: undefined }),
  setCountdown: (countdown) => set({ countdown }),
}));
