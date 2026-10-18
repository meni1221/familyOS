import { useContext } from 'react';
import { ToastContext } from '../components/ui/Toast/context';

/**
 * Reports the outcome of an action — "המשימה נוצרה", "שמירת ההגדרות נכשלה" —
 * as a toast in the corner of the screen.
 *
 * ```tsx
 * const toast = useToast();
 * toast.success('המשימה נוצרה');
 * ```
 */
export function useToast() {
  const api = useContext(ToastContext);

  if (!api) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }

  return api;
}
