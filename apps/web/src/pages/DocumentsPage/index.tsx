import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconDownload, IconFileText, IconPlus, IconUpload } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { formatBytes, formatDate } from '../../lib/format';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import DeleteButton from '../../components/ui/DeleteButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { FamilyDocument } from '../../lib/types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const documentSchema = z.object({
  title: z.string().min(1, 'נדרש שם למסמך'),
  category: z.string().min(1, 'נדרשת קטגוריה'),
  description: z.string().optional(),
  issuedAt: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

export default function DocumentsPage() {
  const client = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () =>
      (await api.get<{ data: FamilyDocument[] }>('/api/v1/documents')).data ?? [],
  });

  const uploadDocument = useMutation({
    mutationFn: (values: DocumentFormData & { file: File }) => {
      const form = new FormData();
      form.append('title', values.title);
      form.append('category', values.category);
      if (values.description?.trim()) form.append('description', values.description.trim());
      if (values.issuedAt) {
        form.append('issuedAt', new Date(values.issuedAt).toISOString());
      }
      form.append('file', values.file);

      return api.postForm('/api/v1/documents', form);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['documents'] });
      closeForm();
    },
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/documents/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: { title: '', category: '', description: '', issuedAt: '' },
  });

  const closeForm = () => {
    setIsFormOpen(false);
    setFile(null);
    setFileError('');
    reset({ title: '', category: '', description: '', issuedAt: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (values: DocumentFormData) => {
    if (!file) {
      setFileError('נדרש לבחור קובץ');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`הקובץ גדול מדי (מקסימום ${formatBytes(MAX_FILE_SIZE_BYTES)})`);
      return;
    }

    setFileError('');
    await uploadDocument.mutateAsync({ ...values, file });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">מסמכים</h1>
        <button type="button" className="btn-primary btn-sm" onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          העלה מסמך
        </button>
      </div>

      {deleteDocument.isError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {deleteDocument.error instanceof Error
            ? deleteDocument.error.message
            : 'המחיקה נכשלה'}
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <EmptyState icon={IconFileText} title="שגיאה בטעינת מסמכים" description="נסו שוב מאוחר יותר" />
      ) : (documents ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconFileText}
            title="אין מסמכים"
            description="העלו מסמכים חשובים כדי לשמור עליהם במקום אחד ומאובטח"
            action={
              <button type="button" className="btn-secondary btn-sm" onClick={() => setIsFormOpen(true)}>
                <IconUpload className="h-4 w-4" />
                העלה מסמך ראשון
              </button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {(documents ?? []).map((document) => (
            <li key={document.id} className="card flex flex-wrap items-center gap-3 py-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4 bg-sand text-ink-secondary"
                aria-hidden="true"
              >
                <IconFileText className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{document.title}</p>
                <p className="break-words text-xs text-ink-secondary" dir="ltr">
                  {document.originalName ?? document.title} · {formatBytes(document.sizeBytes)} ·{' '}
                  {formatDate(document.createdAt)}
                </p>
                {document.description && (
                  <p className="break-words text-xs text-ink-secondary">{document.description}</p>
                )}
              </div>

              <Badge variant="neutral">{document.category}</Badge>

              <a
                className="btn-ghost btn-sm"
                href={document.downloadUrl}
                download={document.originalName ?? undefined}
              >
                <IconDownload className="h-4 w-4" />
                הורדה
              </a>

              <DeleteButton
                itemLabel={`המסמך "${document.title}"`}
                disabled={deleteDocument.isPending}
                onConfirm={() => deleteDocument.mutate(document.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={isFormOpen}
        title="העלאת מסמך"
        onClose={closeForm}
        footer={
          <>
            <button
              type="submit"
              form="document-form"
              className="btn-primary btn-sm"
              disabled={isSubmitting || uploadDocument.isPending}
            >
              {uploadDocument.isPending ? 'מעלה…' : 'העלאה'}
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={closeForm}>
              ביטול
            </button>
          </>
        }
      >
        <form id="document-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register('title')}
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
                {...register('category')}
              />
              {errors.category && (
                <p className="mt-1 text-xs text-error">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="document-issued" className="label">
                תאריך הנפקה
              </label>
              <input id="document-issued" type="date" className="input" {...register('issuedAt')} />
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
              {...register('description')}
            />
          </div>

          {uploadDocument.isError && (
            <p className="text-xs text-error" role="alert">
              {uploadDocument.error instanceof Error
                ? uploadDocument.error.message
                : 'ההעלאה נכשלה'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
