import { useContext } from 'react';
import { ConfirmContext } from '../components/ui/ConfirmProvider/context';

/**
 * Asks the user to confirm something, in the app's own dialog, and resolves
 * once they answer.
 *
 * ```tsx
 * const confirm = useConfirm();
 * const ok = await confirm({
 *   title: 'למחוק את המסמך?',
 *   description: 'הקובץ יימחק לצמיתות.',
 *   confirmLabel: 'מחיקה',
 *   tone: 'danger',
 * });
 * ```
 */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);

  if (!confirm) {
    throw new Error('useConfirm must be used inside <ConfirmProvider>');
  }

  return confirm;
}
