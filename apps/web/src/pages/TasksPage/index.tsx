import { useEffect, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconCheck, IconPlus } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useFamilyMembers } from '../../hooks/useFamily';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/ui/EmptyState';
import LoadMore from '../../components/ui/LoadMore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Page, Task } from '../../lib/types';
import TaskFilterBar from './TaskFilterBar';
import TaskList from './TaskList';
import TaskFormModal from './TaskFormModal';
import type { TaskFilter } from './types';
import type { TaskFormData } from './schemas';

const TASKS_PAGE_SIZE = 50;

const fetchTaskPage = async (filter: TaskFilter, offset: number): Promise<Page<Task>> => {
  const params = new URLSearchParams({
    limit: String(TASKS_PAGE_SIZE),
    offset: String(offset),
  });
  if (filter !== 'all') params.set('status', filter);

  return api.get<Page<Task>>(`/api/v1/tasks?${params.toString()}`);
};

const fetchTask = async (id: string): Promise<Task> =>
  (await api.get<{ data: Task }>(`/api/v1/tasks/${id}`)).data;

/**
 * The family task board: the filter row, the list and the dialog that adds a
 * task. The filter is the server's, so the list is never a filtered view of
 * whatever page happens to be loaded.
 */
const TasksPage = () => {
  const client = useQueryClient();
  const toast = useToast();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // A notification link arrives as `/app/tasks?focus=<id>`: the task is then
  // brought into view, which also means showing the whole list rather than
  // whatever filter was left behind.
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get('focus') ?? undefined;

  useEffect(() => {
    if (focusId) setFilter('all');
  }, [focusId]);

  const { data: pages, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['tasks', filter],
      queryFn: ({ pageParam }) => fetchTaskPage(filter, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.hasMore ? allPages.length * TASKS_PAGE_SIZE : undefined,
    });

  const loadedTasks = pages?.pages.flatMap((page) => page.data) ?? [];

  // The focused task may be older than the first page, so it is fetched on its
  // own and put on top rather than searched for among the loaded rows.
  const { data: focusedTask } = useQuery({
    queryKey: ['tasks', 'one', focusId],
    queryFn: () => fetchTask(focusId as string),
    enabled: Boolean(focusId),
    retry: false,
  });

  const tasks =
    focusedTask && !loadedTasks.some((task) => task.id === focusedTask.id)
      ? [focusedTask, ...loadedTasks]
      : loadedTasks;

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
    onSuccess: () => {
      invalidate();
      toast.success('המשימה נוצרה');
    },
    onError: (error) => toast.error('המשימה לא נוצרה', errorMessage(error)),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/v1/tasks/${id}`, { status }),
    onSuccess: invalidate,
    onError: (error) => toast.error('עדכון המשימה נכשל', errorMessage(error)),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/tasks/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('המשימה נמחקה');
    },
    onError: (error) => toast.error('מחיקת המשימה נכשלה', errorMessage(error)),
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
        tasks={tasks}
        members={members ?? []}
        focusId={focusId}
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

      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onClick={() => void fetchNextPage()}
        label="עוד משימות"
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
};

export default TasksPage;
