import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { useFamilyMembers } from '../../hooks/useFamily';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Task } from '../../lib/types';
import TaskFilterBar from './TaskFilterBar';
import TaskList from './TaskList';
import TaskFormModal from './TaskFormModal';
import type { TaskFilter } from './types';
import type { TaskFormData } from './schemas';

async function fetchTasks(): Promise<Task[]> {
  const response = await api.get<{ data: Task[] }>('/api/v1/tasks');
  return response.data ?? [];
}

/**
 * The family task board: the filter row, the list and the dialog that adds a
 * task. The pieces live next to this file.
 */
export default function TasksPage() {
  const client = useQueryClient();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const { data: members } = useFamilyMembers();

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['tasks'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createTask = useMutation({
    mutationFn: (values: TaskFormData) =>
      api.post('/api/v1/tasks', {
        ...values,
        description: values.description?.trim() || undefined,
        category: values.category?.trim() || undefined,
        dueAt: values.dueAt ? new Date(values.dueAt).toISOString() : undefined,
        assigneeUserId: values.assigneeUserId || undefined,
      }),
    onSuccess: invalidate,
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/v1/tasks/${id}`, { status }),
    onSuccess: invalidate,
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/tasks/${id}`),
    onSuccess: invalidate,
  });

  const onSubmit = async (values: TaskFormData) => {
    await createTask.mutateAsync(values);
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState icon={IconCheck} title="שגיאה בטעינת משימות" description="נסו שוב מאוחר יותר" />
    );
  }

  const filteredTasks = (tasks ?? []).filter((task) => {
    if (filter === 'open') return task.status !== 'COMPLETED';
    if (filter === 'completed') return task.status === 'COMPLETED';
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">משימות</h1>
        <button type="button" className="btn-primary btn-sm" onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4" />
          משימה חדשה
        </button>
      </div>

      <TaskFilterBar filter={filter} onChange={setFilter} />

      <TaskList
        tasks={filteredTasks}
        members={members ?? []}
        isUpdating={updateTask.isPending}
        isDeleting={deleteTask.isPending}
        deleteError={deleteTask.error}
        onCreate={() => setIsFormOpen(true)}
        onToggle={(task) =>
          updateTask.mutate({
            id: task.id,
            status: task.status === 'COMPLETED' ? 'OPEN' : 'COMPLETED',
          })
        }
        onDelete={(id) => deleteTask.mutate(id)}
      />

      <TaskFormModal
        open={isFormOpen}
        members={members ?? []}
        isPending={createTask.isPending}
        error={createTask.error}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onSubmit}
      />
    </div>
  );
}
