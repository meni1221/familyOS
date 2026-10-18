import { useMemo } from 'react';
import { IconBabyBottle, IconFile, IconPlus } from '@tabler/icons-react';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatDate, formatTime, toDateInputValue } from '../../../lib/format';
import type { BabyLog } from '../../../lib/types';
import { detailSummary } from '../detailSummary';
import { LOG_TYPES } from '../logTypes';

interface BabyTimelineProps {
  logs: BabyLog[];
  isLoading: boolean;
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

/** The recorded activity, grouped by day, newest first. */
export default function BabyTimeline({
  logs,
  isLoading,
  isDeleting,
  onAdd,
  onDelete,
}: BabyTimelineProps) {
  const groupedLogs = useMemo(() => {
    const groups = new Map<string, BabyLog[]>();
    for (const log of logs) {
      const key = toDateInputValue(new Date(log.occurredAt));
      const list = groups.get(key) ?? [];
      list.push(log);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [logs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={IconBabyBottle}
          title="אין רשומות עדיין"
          description="התחילו לרשום את הפעילות הראשונה של התינוק"
          action={
            <button type="button" className="btn-primary btn-sm" onClick={onAdd}>
              <IconPlus className="h-4 w-4" />
              רשום פעילות
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupedLogs.map(([day, dayLogs]) => (
        <section key={day}>
          <h2 className="mb-2 text-sm font-semibold text-ink">{formatDate(day)}</h2>
          <ul className="space-y-2">
            {dayLogs.map((log) => {
              const meta = LOG_TYPES.find((item) => item.type === log.type);
              const Icon = meta?.icon ?? IconFile;
              const details = detailSummary(log);

              return (
                <li key={log.id} className="card flex flex-wrap items-center gap-3 py-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-light text-forest"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">
                      {meta?.label ?? log.type} · {formatTime(log.occurredAt)}
                    </p>
                    {(details.length > 0 || log.note) && (
                      <p className="break-words text-xs text-ink-secondary">
                        {[...details, log.note].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>

                  <DeleteButton
                    itemLabel={`הרשומה מ-${formatTime(log.occurredAt)}`}
                    disabled={isDeleting}
                    onConfirm={() => onDelete(log.id)}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
