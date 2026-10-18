import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ConfirmDialog from '../ConfirmDialog';
import { ConfirmContext, ConfirmFn, ConfirmOptions } from './context';

type PendingConfirm = ConfirmOptions & { resolve: (confirmed: boolean) => void };

/**
 * Renders one confirm dialog for the whole app and hands out the
 * `useConfirm()` function that opens it.
 *
 * ```tsx
 * const confirm = useConfirm();
 * if (await confirm({ title: 'למחוק את הקובץ?', tone: 'danger' })) remove();
 * ```
 */
export default function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>(
    (options) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      }),
    []
  );

  const settle = useCallback(
    (confirmed: boolean) => {
      setPending((current) => {
        current?.resolve(confirmed);
        return null;
      });
    },
    []
  );

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      <ConfirmDialog
        open={pending !== null}
        title={pending?.title ?? ''}
        description={pending?.description}
        confirmLabel={pending?.confirmLabel ?? 'אישור'}
        cancelLabel={pending?.cancelLabel ?? 'ביטול'}
        tone={pending?.tone ?? 'default'}
        onConfirm={() => settle(true)}
        onCancel={() => settle(false)}
      />
    </ConfirmContext.Provider>
  );
}
