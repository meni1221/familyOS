import type { DashboardPayload } from '../../../lib/types';
import DashboardCard from '../DashboardCard';

interface TasksCardProps {
  tasks: DashboardPayload['tasks']['today'];
  overdueCount: number;
}

/** Up to three tasks due today, plus how many are past their date. */
const TasksCard = ({ tasks, overdueCount }: TasksCardProps) => {
  return (
    <DashboardCard title="משימות להיום" to="/app/tasks">
      {tasks.length ? (
        <ul className="space-y-2">
          {tasks.slice(0, 3).map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest" aria-hidden="true" />
              <span className="truncate text-sm text-ink">{task.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-secondary">אין משימות להיום</p>
      )}

      {overdueCount > 0 && (
        <p className="mt-3 text-xs text-error">{overdueCount} משימות שעברו את מועד היעד</p>
      )}
    </DashboardCard>
  );
};

export default TasksCard;
