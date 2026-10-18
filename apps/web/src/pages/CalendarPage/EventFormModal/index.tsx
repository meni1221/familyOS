import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { eventSchema, type EventFormData } from '../schemas';

interface EventFormModalProps {
  open: boolean;
  /** The day the event starts on, pre-filled from the clicked cell. */
  defaultDate: string;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: EventFormData) => void;
}

/** Dialog for adding one calendar event. */
export default function EventFormModal({
  open,
  defaultDate,
  isPending,
  error,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      date: defaultDate,
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      category: '',
      description: '',
    },
  });

  // Every opening starts blank on the day that was clicked.
  useEffect(() => {
    if (open) {
      form.reset({
        title: '',
        date: defaultDate,
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        category: '',
        description: '',
      });
    }
  }, [open, defaultDate, form]);

  const { errors } = form.formState;

  return (
    <Modal
      open={open}
      title="אירוע חדש"
      onClose={onClose}
      footer={
        <>
          <button
            type="submit"
            form="event-form"
            className="btn-primary btn-sm"
            disabled={form.formState.isSubmitting || isPending}
          >
            {isPending ? 'יוצר…' : 'יצירת אירוע'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="event-title" className="label">
            שם האירוע
          </label>
          <input
            id="event-title"
            className={`input ${errors.title ? 'input-error' : ''}`}
            {...form.register('title')}
          />
          {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="event-date" className="label">
              תאריך
            </label>
            <input id="event-date" type="date" className="input" {...form.register('date')} />
          </div>
          <div>
            <label htmlFor="event-start" className="label">
              משעה
            </label>
            <input id="event-start" type="time" className="input" {...form.register('startTime')} />
          </div>
          <div>
            <label htmlFor="event-end" className="label">
              עד שעה
            </label>
            <input id="event-end" type="time" className="input" {...form.register('endTime')} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-location" className="label">
              מקום
            </label>
            <input id="event-location" className="input" {...form.register('location')} />
          </div>
          <div>
            <label htmlFor="event-category" className="label">
              קטגוריה
            </label>
            <input
              id="event-category"
              className="input"
              placeholder="בית, בית ספר, עבודה…"
              {...form.register('category')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="event-description" className="label">
            תיאור
          </label>
          <textarea
            id="event-description"
            rows={3}
            className="input"
            {...form.register('description')}
          />
        </div>

        {(errors.date || errors.startTime || errors.endTime) && (
          <p className="text-xs text-error" role="alert">
            נדרשים תאריך ושעות התחלה וסיום
          </p>
        )}

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'יצירת האירוע נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
}
