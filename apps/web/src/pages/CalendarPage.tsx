import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '@tabler/icons-react';
import { api } from '../lib/api';
import { formatMonth, formatTime, toDateInputValue } from '../lib/format';
import Modal from '../components/ui/Modal';
import DeleteButton from '../components/ui/DeleteButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { CalendarEvent } from '../lib/types';

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

const eventSchema = z.object({
  title: z.string().min(1, 'נדרש שם לאירוע'),
  date: z.string().min(1, 'נדרש תאריך'),
  startTime: z.string().min(1, 'נדרשת שעת התחלה'),
  endTime: z.string().min(1, 'נדרשת שעת סיום'),
  location: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

function monthRange(date: Date): { start: string; end: string } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

function dayKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

export default function CalendarPage() {
  const client = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const range = monthRange(currentDate);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async () => {
      const response = await api.get<{ data: CalendarEvent[] }>(
        `/api/v1/calendar?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(
          range.end
        )}`
      );
      return response.data ?? [];
    },
  });

  const createEvent = useMutation({
    mutationFn: (values: EventFormData) =>
      api.post('/api/v1/calendar', {
        title: values.title,
        description: values.description?.trim() || undefined,
        location: values.location?.trim() || undefined,
        category: values.category?.trim() || undefined,
        startsAt: new Date(`${values.date}T${values.startTime}:00`).toISOString(),
        endsAt: new Date(`${values.date}T${values.endTime}:00`).toISOString(),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['calendar'] });
      void client.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/calendar/${id}`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['calendar'] });
      void client.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({ resolver: zodResolver(eventSchema) });

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events ?? []) {
      const key = dayKey(event.startsAt);
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const openForm = (date: Date) => {
    reset({
      title: '',
      date: toDateInputValue(date),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      category: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: EventFormData) => {
    await createEvent.mutateAsync(values);
    setIsFormOpen(false);
  };

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = dayKey(new Date());

  const cells: Array<React.ReactNode> = [];
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
          onClick={() => openForm(date)}
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
    <div>
      <div className="page-header">
        <h1 className="page-title">יומן משפחתי</h1>
        <button type="button" className="btn-primary btn-sm" onClick={() => openForm(new Date())}>
          <IconPlus className="h-4 w-4" />
          אירוע חדש
        </button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="btn-ghost btn-sm"
            aria-label="חודש קודם"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-semibold text-ink">{formatMonth(currentDate)}</h2>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
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
        ) : error ? (
          <p className="py-6 text-center text-sm text-error">שגיאה בטעינת היומן</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">{cells}</div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="section-title mb-3">אירועי החודש</h2>

        {deleteEvent.isError && (
          <p className="mb-3 text-sm text-error" role="alert">
            {deleteEvent.error instanceof Error ? deleteEvent.error.message : 'המחיקה נכשלה'}
          </p>
        )}

        {(events ?? []).length === 0 ? (
          <div className="card">
            <EmptyState
              icon={IconCalendar}
              title="אין אירועים בחודש הזה"
              description="הוסיפו אירוע כדי שכולם במשפחה יראו"
              action={
                <button type="button" className="btn-primary btn-sm" onClick={() => openForm(new Date())}>
                  <IconPlus className="h-4 w-4" />
                  אירוע חדש
                </button>
              }
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {(events ?? []).map((event) => (
              <li key={event.id} className="card flex flex-wrap items-center gap-3 py-3">
                <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-4 bg-sand text-[10px] leading-tight text-ink">
                  <span className="font-bold">
                    {new Date(event.startsAt).getDate()}
                  </span>
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
                  disabled={deleteEvent.isPending}
                  onConfirm={() => deleteEvent.mutate(event.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={isFormOpen}
        title="אירוע חדש"
        onClose={() => setIsFormOpen(false)}
        footer={
          <>
            <button
              type="submit"
              form="event-form"
              className="btn-primary btn-sm"
              disabled={isSubmitting || createEvent.isPending}
            >
              {createEvent.isPending ? 'יוצר…' : 'יצירת אירוע'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setIsFormOpen(false)}
            >
              ביטול
            </button>
          </>
        }
      >
        <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="event-title" className="label">
              שם האירוע
            </label>
            <input
              id="event-title"
              className={`input ${errors.title ? 'input-error' : ''}`}
              {...register('title')}
            />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="event-date" className="label">
                תאריך
              </label>
              <input id="event-date" type="date" className="input" {...register('date')} />
            </div>
            <div>
              <label htmlFor="event-start" className="label">
                משעה
              </label>
              <input id="event-start" type="time" className="input" {...register('startTime')} />
            </div>
            <div>
              <label htmlFor="event-end" className="label">
                עד שעה
              </label>
              <input id="event-end" type="time" className="input" {...register('endTime')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event-location" className="label">
                מקום
              </label>
              <input id="event-location" className="input" {...register('location')} />
            </div>
            <div>
              <label htmlFor="event-category" className="label">
                קטגוריה
              </label>
              <input
                id="event-category"
                className="input"
                placeholder="בית, בית ספר, עבודה…"
                {...register('category')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-description" className="label">
              תיאור
            </label>
            <textarea id="event-description" rows={3} className="input" {...register('description')} />
          </div>

          {(errors.date || errors.startTime || errors.endTime) && (
            <p className="text-xs text-error" role="alert">
              נדרשים תאריך ושעות התחלה וסיום
            </p>
          )}

          {createEvent.isError && (
            <p className="text-xs text-error" role="alert">
              {createEvent.error instanceof Error ? createEvent.error.message : 'יצירת האירוע נכשלה'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
