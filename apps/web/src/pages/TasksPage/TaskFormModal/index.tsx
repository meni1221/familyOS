import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { toDateInputValue } from '../../../lib/format';
import type { FamilyMember } from '../../../lib/types';
import { taskSchema, type TaskFormData } from '../schemas';

interface TaskFormModalProps {
  open: boolean;
  /** For the assignee picker. */
  members: FamilyMember[];
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: TaskFormData) => void;
}

/** Dialog for adding one task. */
const TaskFormModal = ({
  open,
  members,
  isPending,
  error,
  onClose,
  onSubmit,
}: TaskFormModalProps) => {
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM', title: '', description: '', category: '' },
  });

  // Every opening starts blank on a medium priority.
  useEffect(() => {
    if (open) {
      form.reset({
        priority: 'MEDIUM',
        title: '',
        description: '',
        category: '',
        dueAt: '',
        assigneeUserId: '',
      });
    }
  }, [open, form]);

  const { errors } = form.formState;

  return (
    <Modal
      open={open}
      title="משימה חדשה"
      onClose={onClose}
      footer={
        <>
          <button
            type="submit"
            form="task-form"
            className="btn-primary btn-sm"
            disabled={form.formState.isSubmitting || isPending}
          >
            {isPending ? 'יוצר…' : 'יצירת משימה'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="label">
            שם המשימה
          </label>
          <input
            id="task-title"
            className={`input ${errors.title ? 'input-error' : ''}`}
            {...form.register('title')}
          />
          {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="task-priority" className="label">
              עדיפות
            </label>
            <select id="task-priority" className="input" {...form.register('priority')}>
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
              {...form.register('dueAt')}
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
              {...form.register('category')}
            />
          </div>

          <div>
            <label htmlFor="task-assignee" className="label">
              אחראי/ת
            </label>
            <select id="task-assignee" className="input" {...form.register('assigneeUserId')}>
              <option value="">ללא שיוך</option>
              {members.map((member) => (
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
          <textarea
            id="task-description"
            rows={3}
            className="input"
            {...form.register('description')}
          />
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'יצירת המשימה נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default TaskFormModal;
