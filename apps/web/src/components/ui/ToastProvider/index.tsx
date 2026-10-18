import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Toast from '../Toast';
import {
  ToastApi,
  ToastContext,
  ToastInput,
  ToastRecord,
  ToastVariant,
} from '../Toast/context';

/** How long each kind of message stays before it fades out on its own. */
const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
};

/** Old messages make way for new ones, so the stack never grows forever. */
const MAX_VISIBLE = 3;

/**
 * Owns the toast stack: `useToast()` anywhere below it, one fixed container
 * above the app's content. Toasts are announced through `role="status"`
 * (errors through `role="alert"`), and their countdown pauses while the user
 * hovers or focuses them.
 */
export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef(new Map<number, number>());
  const nextId = useRef(1);

  const stopTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  // Every toast that leaves the stack — dismissed, replaced or unmounted —
  // takes its pending timer with it.
  useEffect(() => {
    const live = new Set(toasts.map((toast) => toast.id));
    for (const id of [...timers.current.keys()]) {
      if (!live.has(id)) stopTimer(id);
    }
  }, [toasts, stopTimer]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const startTimer = useCallback(
    (record: ToastRecord) => {
      if (record.duration <= 0) return;
      stopTimer(record.id);
      timers.current.set(
        record.id,
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== record.id));
        }, record.duration)
      );
    },
    [stopTimer]
  );

  const dismiss = useCallback(
    (id: number) => {
      stopTimer(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [stopTimer]
  );

  const show = useCallback(
    ({ message, description, variant = 'info', duration }: ToastInput) => {
      const id = nextId.current++;
      const record: ToastRecord = {
        id,
        variant,
        message,
        description,
        duration: duration ?? DEFAULT_DURATIONS[variant],
      };

      setToasts((current) => [...current, record].slice(-MAX_VISIBLE));
      startTimer(record);
      return id;
    },
    [startTimer]
  );

  const pause = useCallback((id: number) => stopTimer(id), [stopTimer]);

  const resume = useCallback(
    (id: number) => {
      const record = toasts.find((toast) => toast.id === id);
      if (record) startTimer(record);
    },
    [toasts, startTimer]
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      dismiss,
      success: (message, description) => show({ message, description, variant: 'success' }),
      error: (message, description) => show({ message, description, variant: 'error' }),
      info: (message, description) => show({ message, description, variant: 'info' }),
      warning: (message, description) => show({ message, description, variant: 'warning' }),
    }),
    [show, dismiss]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* The region is always mounted so screen readers announce changes. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-24 end-6 z-[1100] hidden w-80 flex-col gap-2 md:flex print:hidden"
      >
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            onPause={pause}
            onResume={resume}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
