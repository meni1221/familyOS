import { IconDownload, IconFileText, IconUpload } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatBytes, formatDate } from '../../../lib/format';
import type { FamilyDocument } from '../../../lib/types';

interface DocumentListProps {
  documents: FamilyDocument[];
  isLoading: boolean;
  /** The list could not be loaded at all. */
  hasError: boolean;
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  /** Mutation error of the deletion, shown when it happened. */
  deleteError: unknown;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

/** The stored documents, each with its size, date, download and delete. */
export default function DocumentList({
  documents,
  isLoading,
  hasError,
  isDeleting,
  deleteError,
  onCreate,
  onDelete,
}: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <EmptyState icon={IconFileText} title="שגיאה בטעינת מסמכים" description="נסו שוב מאוחר יותר" />
    );
  }

  return (
    <>
      {Boolean(deleteError) && (
        <p className="mb-3 text-sm text-error" role="alert">
          {deleteError instanceof Error ? deleteError.message : 'המחיקה נכשלה'}
        </p>
      )}

      {documents.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconFileText}
            title="אין מסמכים"
            description="העלו מסמכים חשובים כדי לשמור עליהם במקום אחד ומאובטח"
            action={
              <button type="button" className="btn-secondary btn-sm" onClick={onCreate}>
                <IconUpload className="h-4 w-4" />
                העלה מסמך ראשון
              </button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((document) => (
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
                disabled={isDeleting}
                onConfirm={() => onDelete(document.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
