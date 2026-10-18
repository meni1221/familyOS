import { formatTime } from '../../../lib/format';
import type { DashboardPayload } from '../../../lib/types';
import DashboardCard from '../DashboardCard';

interface EventsCardProps {
  events: DashboardPayload['events']['today'];
}

/** Up to three events happening today. */
const EventsCard = ({ events }: EventsCardProps) => {
  return (
    <DashboardCard title="אירועים היום" to="/app/calendar">
      {events.length ? (
        <ul className="space-y-2">
          {events.slice(0, 3).map((event) => (
            <li key={event.id} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
              <span className="truncate text-sm text-ink">
                {formatTime(event.startsAt)} · {event.title}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-secondary">אין אירועים להיום</p>
      )}
    </DashboardCard>
  );
};

export default EventsCard;
