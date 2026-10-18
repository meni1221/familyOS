import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueAt?: string;
  assigneeUserId?: string;
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/v1/tasks', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.data ?? [];
}

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

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all');
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

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
        <button className="btn-primary btn-sm">
          <IconPlus className="h-4 w-4" />
          משימה חדשה
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {(['all', 'open', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-4 px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-forest text-white'
                : 'bg-cream text-ink-secondary hover:bg-border'
            }`}
          >
            {f === 'all' ? 'הכל' : f === 'open' ? 'פתוחות' : 'הושלמו'}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={IconCheck}
          title="אין משימות"
          description="צרו את המשימה הראשונה שלכם"
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card flex items-center gap-3 py-3"
            >
              <button
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  task.status === 'COMPLETED'
                    ? 'border-forest bg-forest text-white'
                    : 'border-border hover:border-forest'
                }`}
              >
                {task.status === 'COMPLETED' && <IconCheck className="h-3 w-3" />}
              </button>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    task.status === 'COMPLETED'
                      ? 'text-ink-secondary line-through'
                      : 'text-ink'
                  }`}
                >
                  {task.title}
                </p>
                {task.dueAt && (
                  <p className="text-xs text-ink-secondary">
                    {new Date(task.dueAt).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={priorityVariants[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
                <Badge variant="neutral">{statusLabels[task.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
