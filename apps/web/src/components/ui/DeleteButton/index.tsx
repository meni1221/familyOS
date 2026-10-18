import { useEffect, useRef, useState } from 'react';
import { IconTrash } from '@tabler/icons-react';

interface DeleteButtonProps {
  onConfirm: () => void;
  /** Describes what is being deleted, e.g. "את המשימה קניות". */
  itemLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Two-step destructive action: the first click arms the button, the second
 * confirms. Avoids a blocking `window.confirm()` while still preventing
 * accidental deletes; the armed state resets on blur or after a few seconds.
 */
export default function DeleteButton({
  onConfirm,
  itemLabel,
  disabled = false,
  className = '',
}: DeleteButtonProps) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const arm = () => {
    setArmed(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setArmed(false), 4000);
  };

  const handleClick = () => {
    if (!armed) {
      arm();
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    setArmed(false);
    onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onBlur={() => setArmed(false)}
      disabled={disabled}
      className={`btn-ghost btn-sm shrink-0 ${
        armed ? 'bg-red-50 text-error hover:bg-red-100' : 'text-error'
      } ${className}`}
      aria-label={armed ? `אישור מחיקה של ${itemLabel}` : `מחיקת ${itemLabel}`}
    >
      <IconTrash className="h-4 w-4" />
      {armed ? 'אישור מחיקה?' : 'מחיקה'}
    </button>
  );
}
