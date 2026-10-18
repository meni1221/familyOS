import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { formatBytes } from '../../../lib/format';
import { MAX_FILE_SIZE_BYTES, documentSchema, type DocumentFormData } from '../schemas';

interface DocumentFormModalProps {
  open: boolean;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: DocumentFormData & { file: File }) => void;
}

/** Dialog for uploading one document, file checks included. */
const DocumentFormModal = ({
  open,
  isPending,
  error,
  onClose,
  onSubmit,
}: DocumentFormModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: '', category: '', description: '', issuedAt: '' },
  });

  // Every opening starts empty, including the file picker.
  useEffect(() => {
    if (open) {
      form.reset({ title: '', category: '', description: '', issuedAt: '' });
      setFile(null);
      setFileError('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, form]);

  const { errors } = form.formState;

  const submit = (values: DocumentFormData) => {
    if (!file) {
      setFileError('נדרש לבחור קובץ');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`הקובץ גדול מדי (מקסימום ${formatBytes(MAX_FILE_SIZE_BYTES)})`);
      return;
    }

    setFileError('');
    onSubmit({ ...values, file });
  };

  return (
    <Modal
      open={open}
      title="העלאת מסמך"
      onClose={onClose}
      footer={
        <>
          <button
            type="submit"
            form="document-form"
            className="btn-primary btn-sm"
            disabled={form.formState.isSubmitting || isPending}
          >
            {isPending ? 'מעלה…' : 'העלאה'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form id="document-form" onSubmit={form.handleSubmit(submit)} className="space-y-4">
        <div>
          <label htmlFor="document-file" className="label">
            קובץ
          </label>
          <input
            id="document-file"
            ref={fileInputRef}
            type="file"
            className={`input ${fileError ? 'input-error' : ''}`}
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setFileError('');
            }}
          />
          <p className="mt-1 text-xs text-ink-secondary">
            PDF, JPG, PNG או מסמכי Word, עד {formatBytes(MAX_FILE_SIZE_BYTES)}
          </p>
          {fileError && <p className="mt-1 text-xs text-error">{fileError}</p>}
        </div>

        <div>
          <label htmlFor="document-title" className="label">
            שם המסמך
          </label>
          <input
            id="document-title"
            className={`input ${errors.title ? 'input-error' : ''}`}
            {...form.register('title')}
          />
          {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="document-category" className="label">
              קטגוריה
            </label>
            <input
              id="document-category"
              className={`input ${errors.category ? 'input-error' : ''}`}
              placeholder="חוזים, ביטוח, בריאות…"
              {...form.register('category')}
            />
            {errors.category && (
              <p className="mt-1 text-xs text-error">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="document-issued" className="label">
              תאריך הנפקה
            </label>
            <input
              id="document-issued"
              type="date"
              className="input"
              {...form.register('issuedAt')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="document-description" className="label">
            תיאור
          </label>
          <textarea
            id="document-description"
            rows={3}
            className="input"
            {...form.register('description')}
          />
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'ההעלאה נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default DocumentFormModal;
