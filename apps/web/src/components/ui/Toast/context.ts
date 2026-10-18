import { createContext } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastRecord {
  id: number;
  variant: ToastVariant;
  message: string;
  description?: string;
  /** Milliseconds on screen; `0` keeps the toast until it is dismissed. */
  duration: number;
}

export interface ToastInput {
  message: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

/** What `useToast` hands back to the screens. */
export interface ToastApi {
  show: (input: ToastInput) => number;
  success: (message: string, description?: string) => number;
  error: (message: string, description?: string) => number;
  info: (message: string, description?: string) => number;
  warning: (message: string, description?: string) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
