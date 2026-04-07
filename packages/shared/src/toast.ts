import { create } from 'zustand';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastState {
  message: string;
  visible: boolean;
  action: ToastAction | null;
  countdown: number | undefined;
  show: (message: string, opts?: { action?: ToastAction; countdown?: number }) => void;
  hide: () => void;
  setCountdown: (n: number) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  action: null,
  countdown: undefined,
  show: (message, opts) =>
    set({
      message,
      visible: true,
      action: opts?.action ?? null,
      countdown: opts?.countdown,
    }),
  hide: () => set({ visible: false, action: null, countdown: undefined }),
  setCountdown: (countdown) => set({ countdown }),
}));
