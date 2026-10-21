import { logTypeLabel } from '../../../lib/babyLogTypes';
import { babyColorTokens } from '../../../lib/babyColors';
import { formatDate, formatTime } from '../../../lib/format';
import type { DashboardPayload } from '../../../lib/types';
import DashboardCard from '../DashboardCard';

interface BabyCardProps {
  babyLogs: DashboardPayload['babyLogs'];
}

/**
 * The last few baby routine entries.
 *
 * One baby: the entries themselves. Two or more: a line per baby with their
 * latest one, which is the question a parent of twins is actually asking.
 */
const BabyCard = ({ babyLogs }: BabyCardProps) => {
  const { recent, profiles } = babyLogs;
  const title = profiles.length > 1 ? 'שגרת התינוקות' : 'שגרת התינוק';

  const content = () => {
    if (profiles.length > 1) {
      return (
        <ul className="space-y-3">
          {profiles.map((profile) => {
            const latest = recent.find((log) => log.babyProfileId === profile.id);

            return (
              <li key={profile.id} className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${babyColorTokens(profile.color).dot}`}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-ink">
                  {profile.displayName}
                </span>
                <span className="shrink-0 text-xs text-ink-secondary">
                  {latest
                    ? `${logTypeLabel(latest.type)} · ${formatTime(latest.occurredAt)}`
                    : 'אין רשומות אחרונות'}
                </span>
              </li>
            );
          })}
        </ul>
      );
    }

    if (recent.length === 0) {
      return <p className="text-sm text-ink-secondary">אין רשומות אחרונות</p>;
    }

    return (
      <ul className="space-y-2">
        {recent.slice(0, 3).map((log) => (
          <li key={log.id} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sage" aria-hidden="true" />
            <span className="truncate text-sm text-ink">
              {formatDate(log.occurredAt)} · {formatTime(log.occurredAt)}
              {log.note ? ` · ${log.note}` : ''}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <DashboardCard title={title} to="/app/baby" className="md:col-span-2 lg:col-span-2">
      {content()}
    </DashboardCard>
  );
};

export default BabyCard;
