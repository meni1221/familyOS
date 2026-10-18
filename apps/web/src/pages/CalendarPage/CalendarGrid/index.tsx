import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { formatMonth, formatTime } from '../../../lib/format';
import type { CalendarEvent } from '../../../lib/types';
import { WEEKDAYS, dayKey } from '../calendarUtils';

interface CalendarGridProps {
  /** Any day inside the month being shown. */
  currentDate: Date;
  events: CalendarEvent[];
  isLoading: boolean;
  hasError: boolean;
  onMonthChange: (date: Date) => void;
  /** Clicking a day number opens the event form for that day. */
  onSelectDay: (date: Date) => void;
}

/** The month card: navigation, weekday header and the day cells. */
export default function CalendarGrid({
  currentDate,
  events,
  isLoading,
  hasError,
  onMonthChange,
  onSelectDay,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKey(event.startsAt);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = dayKey(new Date());

  const cells: ReactNode[] = [];
  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(<div key={`empty-${index}`} aria-hidden="true" />);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = dayKey(date);
    const dayEvents = eventsByDay.get(key) ?? [];
    const isToday = key === today;

    cells.push(
      <div
        key={key}
        className={`flex min-h-[4.5rem] flex-col gap-1 rounded-4 border p-1 text-xs ${
          isToday ? 'border-forest bg-sage-light' : 'border-border bg-surface'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelectDay(date)}
          className={`self-start rounded-4 px-1.5 py-0.5 font-medium transition-colors hover:bg-cream ${
            isToday ? 'text-forest' : 'text-ink'
          }`}
          aria-label={`הוספת אירוע ב-${date.toLocaleDateString('he-IL')}`}
        >
          {day}
        </button>

        {dayEvents.slice(0, 2).map((event) => (
          <span
            key={event.id}
            className="truncate rounded-4 bg-forest/10 px-1 text-[11px] text-forest"
            title={`${formatTime(event.startsAt)} ${event.title}`}
          >
            {formatTime(event.startsAt)} {event.title}
          </span>
        ))}
        {dayEvents.length > 2 && (
          <span className="px-1 text-[11px] text-ink-secondary">+{dayEvents.length - 2} נוספים</span>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(year, month - 1, 1))}
          className="btn-ghost btn-sm"
          aria-label="חודש קודם"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-semibold text-ink">{formatMonth(currentDate)}</h2>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(year, month + 1, 1))}
          className="btn-ghost btn-sm"
          aria-label="חודש הבא"
        >
          <IconChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-ink-secondary">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="py-2">
            {weekday}
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : hasError ? (
        <p className="py-6 text-center text-sm text-error">שגיאה בטעינת היומן</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">{cells}</div>
      )}
    </div>
  );
}
