import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { api } from '../lib/api';
import { useFamilyMembers } from '../hooks/useFamily';
import { formatDate, toDateInputValue } from '../lib/format';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import DeleteButton from '../components/ui/DeleteButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Task, TaskPriority } from '../lib/types';

const taskSchema = z.object({
  title: z.string().min(1, 'נדרש שם למשימה'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().optional(),
  dueAt: z.string().optional(),
  assigneeUserId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const statusLabels: Record<string, string> = {
  OPEN: 'פתוחה',
  IN_PROGRESS: 'בתהליך',
  COMPLETED: 'הושלמה',
};

const priorityLabels: Record<string, string> = {
  LOW: 'נמוכה',
  MEDIUM: 'בינונית',
  HIGH: 'גבוהה',
  URGENT: 'דחופה',
};

const priorityVariants: Record<string, 'neutral' | 'warning' | 'error'> = {
  LOW: 'neutral',
  MEDIUM: 'neutral',
  HIGH: 'warning',
  URGENT: 'error',
};

async function fetchTasks(): Promise<Task[]> {
  const response = await api.get<{ data: Task[] }>('/api/v1/tasks');
  return response.data ?? [];
}

export default function TasksPage() {
  const client = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM', title: '', description: '', category: '' },
  });

  const closeForm = () => {
    setIsFormOpen(false);
    reset({ priority: 'MEDIUM', title: '', description: '', category: '', dueAt: '', assigneeUserId: '' });
  };

  const onSubmit = async (values: TaskFormData) => {
    await createTask.mutateAsync(values);
    closeForm();
  };

  const memberName = (userId?: string) =>
    members?.find((member) => member.id === userId)?.displayName;

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

      <div className="mb-4 flex gap-2">
        {(['all', 'open', 'completed'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-4 px-4 py-2 text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-forest text-white'
                : 'bg-cream text-ink-secondary hover:bg-border'
            }`}
          >
            {value === 'all' ? 'הכל' : value === 'open' ? 'פתוחות' : 'הושלמו'}
          </button>
        ))}
      </div>

      {deleteTask.isError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {deleteTask.error instanceof Error ? deleteTask.error.message : 'המחיקה נכשלה'}
        </p>
      )}

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={IconCheck}
          title="אין משימות"
          description="צרו את המשימה הראשונה שלכם"
          action={
            <button type="button" className="btn-primary btn-sm" onClick={() => setIsFormOpen(true)}>
              <IconPlus className="h-4 w-4" />
              משימה חדשה
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div key={task.id} className="card flex flex-wrap items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() =>
                    updateTask.mutate({
                      id: task.id,
                      status: isCompleted ? 'OPEN' : 'COMPLETED',
                    })
                  }
                  disabled={updateTask.isPending}
                  aria-label={
                    isCompleted ? `סימון "${task.title}" כפתוחה` : `סימון "${task.title}" כהושלמה`
                  }
                  aria-pressed={isCompleted}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-forest bg-forest text-white'
                      : 'border-border hover:border-forest'
                  }`}
                >
                  {isCompleted && <IconCheck className="h-3 w-3" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium ${
                      isCompleted ? 'text-ink-secondary line-through' : 'text-ink'
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-ink-secondary">
                    {task.dueAt && <>יעד: {formatDate(task.dueAt)} · </>}
                    {task.category && <>{task.category} · </>}
                    {task.assigneeUserId && (
                      <>אחראי/ת: {memberName(task.assigneeUserId) ?? 'חבר/ת משפחה'}</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={priorityVariants[task.priority as TaskPriority]}>
                    {priorityLabels[task.priority]}
                  </Badge>
                  <Badge variant={isCompleted ? 'success' : 'neutral'}>
                    {statusLabels[task.status]}
                  </Badge>
                  <DeleteButton
                    itemLabel={`המשימה "${task.title}"`}
                    disabled={deleteTask.isPending}
                    onConfirm={() => deleteTask.mutate(task.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={isFormOpen}
        title="משימה חדשה"
        onClose={closeForm}
        footer={
          <>
            <button
              type="submit"
              form="task-form"
              className="btn-primary btn-sm"
              disabled={isSubmitting || createTask.isPending}
            >
              {createTask.isPending ? 'יוצר…' : 'יצירת משימה'}
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={closeForm}>
              ביטול
            </button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="label">
              שם המשימה
            </label>
            <input
              id="task-title"
              className={`input ${errors.title ? 'input-error' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-priority" className="label">
                עדיפות
              </label>
              <select id="task-priority" className="input" {...register('priority')}>
                <option value="LOW">נמוכה</option>
                <option value="MEDIUM">בינונית</option>
                <option value="HIGH">גבוהה</option>
                <option value="URGENT">דחופה</option>
              </select>
            </div>

            <div>
              <label htmlFor="task-due" className="label">
                תאריך יעד
              </label>
              <input
                id="task-due"
                type="date"
                className="input"
                min={toDateInputValue()}
                {...register('dueAt')}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-category" className="label">
                קטגוריה
              </label>
              <input
                id="task-category"
                className="input"
                placeholder="בית, ילדים, קניות…"
                {...register('category')}
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="label">
                אחראי/ת
              </label>
              <select id="task-assignee" className="input" {...register('assigneeUserId')}>
                <option value="">ללא שיוך</option>
                {(members ?? []).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                    {member.isYou ? ' (את/ה)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="task-description" className="label">
              תיאור
            </label>
            <textarea id="task-description" rows={3} className="input" {...register('description')} />
          </div>

          {createTask.isError && (
            <p className="text-xs text-error" role="alert">
              {createTask.error instanceof Error ? createTask.error.message : 'יצירת המשימה נכשלה'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
