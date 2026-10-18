import { IconCheck, IconPlus } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatDate } from '../../../lib/format';
import type { FamilyMember, Task, TaskPriority } from '../../../lib/types';
import { priorityLabels, priorityVariants, statusLabels } from '../taskLabels';

interface TaskListProps {
  tasks: Task[];
  members: FamilyMember[];
  /** A status flip is in flight. */
  isUpdating: boolean;
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  /** Mutation error of the deletion, shown when it happened. */
  deleteError: unknown;
  onCreate: () => void;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

/** The filtered task list, each row with its checkbox, badges and delete. */
export default function TaskList({
  tasks,
  members,
  isUpdating,
  isDeleting,
  deleteError,
  onCreate,
  onToggle,
  onDelete,
}: TaskListProps) {
  const memberName = (userId?: string) =>
    members.find((member) => member.id === userId)?.displayName;

  return (
    <>
      {Boolean(deleteError) && (
        <p className="mb-3 text-sm text-error" role="alert">
          {deleteError instanceof Error ? deleteError.message : 'המחיקה נכשלה'}
        </p>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={IconCheck}
          title="אין משימות"
          description="צרו את המשימה הראשונה שלכם"
          action={
            <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
              <IconPlus className="h-4 w-4" />
              משימה חדשה
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';

            return (
              <div key={task.id} className="card flex flex-wrap items-center gap-3 py-3">
                <button
                  type="button"
                  onClick={() => onToggle(task)}
                  disabled={isUpdating}
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
                    disabled={isDeleting}
                    onConfirm={() => onDelete(task.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
