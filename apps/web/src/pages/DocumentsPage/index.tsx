import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useToast } from '../../hooks/useToast';
import type { FamilyDocument } from '../../lib/types';
import DocumentList from './DocumentList';
import DocumentFormModal from './DocumentFormModal';
import type { DocumentFormData } from './schemas';

/**
 * The family document store: the list and the upload dialog. The pieces live
 * next to this file.
 */
const DocumentsPage = () => {
  const client = useQueryClient();
  const toast = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: documents,
    isLoading,
    error,
  } = useQuery({
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
      toast.success('המסמך הועלה');
    },
    onError: (error) => toast.error('העלאת המסמך נכשלה', errorMessage(error)),
  });

  const deleteDocument = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/documents/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['documents'] });
      toast.success('המסמך נמחק');
    },
    onError: (error) => toast.error('מחיקת המסמך נכשלה', errorMessage(error)),
  });

  const onSubmit = async (values: DocumentFormData & { file: File }) => {
    await uploadDocument.mutateAsync(values);
    setIsFormOpen(false);
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

      <DocumentList
        documents={documents ?? []}
        isLoading={isLoading}
        hasError={Boolean(error)}
        isDeleting={deleteDocument.isPending}
        deleteError={deleteDocument.error}
        onCreate={() => setIsFormOpen(true)}
        onDelete={(id) => deleteDocument.mutate(id)}
      />

      <DocumentFormModal
        open={isFormOpen}
        isPending={uploadDocument.isPending}
        error={uploadDocument.error}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default DocumentsPage;
