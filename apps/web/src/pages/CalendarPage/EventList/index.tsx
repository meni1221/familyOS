import { IconCalendar, IconPlus } from '@tabler/icons-react';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatTime } from '../../../lib/format';
import type { CalendarEvent } from '../../../lib/types';

interface EventListProps {
  events: CalendarEvent[];
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  /** Mutation error of the deletion, shown when it happened. */
  deleteError: unknown;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

/** Everything on the calendar this month, as a plain list. */
const EventList = ({
  events,
  isDeleting,
  deleteError,
  onCreate,
  onDelete,
}: EventListProps) => {
  return (
    <div className="mt-6">
      <h2 className="section-title mb-3">אירועי החודש</h2>

      {Boolean(deleteError) && (
        <p className="mb-3 text-sm text-error" role="alert">
          {deleteError instanceof Error ? deleteError.message : 'המחיקה נכשלה'}
        </p>
      )}

      {events.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconCalendar}
            title="אין אירועים בחודש הזה"
            description="הוסיפו אירוע כדי שכולם במשפחה יראו"
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
                <IconPlus className="h-4 w-4" />
                אירוע חדש
              </button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((event) => (
            <li key={event.id} className="card flex flex-wrap items-center gap-3 py-3">
              <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-4 bg-sand text-[10px] leading-tight text-ink">
                <span className="font-bold">{new Date(event.startsAt).getDate()}</span>
                <span>{formatTime(event.startsAt)}</span>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{event.title}</p>
                <p className="text-xs text-ink-secondary">
                  {formatTime(event.startsAt)}–{formatTime(event.endsAt)}
                  {event.location && <> · {event.location}</>}
                  {event.category && <> · {event.category}</>}
                </p>
              </div>

              <DeleteButton
                itemLabel={`האירוע "${event.title}"`}
                disabled={isDeleting}
                onConfirm={() => onDelete(event.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventList;
