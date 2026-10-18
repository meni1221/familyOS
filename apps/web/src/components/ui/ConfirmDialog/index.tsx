import Modal from '../Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** `danger` is for anything that removes or discards something. */
  tone: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The one dialog every confirmation in the app goes through — deleting a task,
 * revoking an invitation, and whatever else needs a "are you sure?".
 *
 * Built on `Modal`, so Escape, the backdrop click, the focus handling and the
 * scroll lock behave exactly like the form dialogs. Focus lands on the close
 * button rather than on the confirming action, so `Enter` cannot destroy
 * anything by accident.
 */
const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      className="sm:max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onConfirm}
            className={`${tone === 'danger' ? 'btn-danger' : 'btn-primary'} btn-sm`}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary btn-sm">
            {cancelLabel}
          </button>
        </>
      }
    >
      {description && <p className="text-sm text-ink-secondary">{description}</p>}
    </Modal>
  );
};

export default ConfirmDialog;
