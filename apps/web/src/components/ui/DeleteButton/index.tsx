import { IconTrash } from '@tabler/icons-react';
import { useConfirm } from '../../../hooks/useConfirm';

interface DeleteButtonProps {
  onConfirm: () => void;
  /** Describes what is being deleted, e.g. "את המשימה קניות". */
  itemLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * The delete action of a list row: one click, then the app's own confirm
 * dialog. Nothing is removed until the dialog is answered, and the button
 * itself carries no hidden second state to disarm.
 */
export default function DeleteButton({
  onConfirm,
  itemLabel,
  disabled = false,
  className = '',
}: DeleteButtonProps) {
  const confirm = useConfirm();

  const handleClick = async () => {
    const confirmed = await confirm({
      title: 'אישור מחיקה',
      description: `למחוק ${itemLabel}? אי אפשר לבטל את הפעולה.`,
      confirmLabel: 'מחיקה',
      tone: 'danger',
    });

    if (confirmed) onConfirm();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`btn-ghost btn-sm shrink-0 text-error ${className}`}
      aria-label={`מחיקת ${itemLabel}`}
    >
      <IconTrash className="h-4 w-4" />
      מחיקה
    </button>
  );
}
