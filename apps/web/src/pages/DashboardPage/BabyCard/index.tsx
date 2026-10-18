import { formatDate, formatTime } from '../../../lib/format';
import type { DashboardPayload } from '../../../lib/types';
import DashboardCard from '../DashboardCard';

interface BabyCardProps {
  logs: DashboardPayload['babyLogs']['recent'];
}

/** The last few baby routine entries. */
const BabyCard = ({ logs }: BabyCardProps) => {
  return (
    <DashboardCard title="שגרת התינוק" to="/app/baby" className="md:col-span-2 lg:col-span-2">
      {logs.length ? (
        <ul className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <li key={log.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
              <span className="truncate text-sm text-ink">
                {formatDate(log.occurredAt)} · {formatTime(log.occurredAt)}
                {log.note ? ` · ${log.note}` : ''}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-secondary">אין רשומות אחרונות</p>
      )}
    </DashboardCard>
  );
};

export default BabyCard;
