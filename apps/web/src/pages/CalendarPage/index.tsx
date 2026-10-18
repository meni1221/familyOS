import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { toDateInputValue } from '../../lib/format';
import { useToast } from '../../hooks/useToast';
import type { CalendarEvent } from '../../lib/types';
import CalendarGrid from './CalendarGrid';
import EventList from './EventList';
import EventFormModal from './EventFormModal';
import { monthRange } from './calendarUtils';
import type { EventFormData } from './schemas';

/**
 * The family calendar: one month at a time, with the list of that month's events
 * underneath. The grid, the list and the dialog live next to this file.
 */
const CalendarPage = () => {
  const client = useQueryClient();
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  /** The day a new event starts on, or null while the dialog is closed. */
  const [formDate, setFormDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const range = monthRange(currentDate);

  const {
    data: events,
    isLoading,
    error,
  } = useQuery({
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

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['calendar'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

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
      invalidate();
      toast.success('האירוע נוצר');
    },
    onError: (error) => toast.error('יצירת האירוע נכשלה', errorMessage(error)),
  });

  const deleteEvent = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/calendar/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('האירוע נמחק');
    },
    onError: (error) => toast.error('מחיקת האירוע נכשלה', errorMessage(error)),
  });

  const openForm = (date: Date) => setFormDate(toDateInputValue(date));

  const onSubmit = async (values: EventFormData) => {
    await createEvent.mutateAsync(values);
    setFormDate(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">יומן משפחתי</h1>
        <button type="button" className="btn-primary btn-sm" onClick={() => openForm(new Date())}>
          <IconPlus className="h-4 w-4" />
          אירוע חדש
        </button>
      </div>

      <CalendarGrid
        currentDate={currentDate}
        events={events ?? []}
        isLoading={isLoading}
        hasError={Boolean(error)}
        onMonthChange={setCurrentDate}
        onSelectDay={openForm}
      />

      <EventList
        events={events ?? []}
        isDeleting={deleteEvent.isPending}
        deleteError={deleteEvent.error}
        onCreate={() => openForm(new Date())}
        onDelete={(id) => deleteEvent.mutate(id)}
      />

      <EventFormModal
        open={formDate !== null}
        defaultDate={formDate ?? toDateInputValue()}
        isPending={createEvent.isPending}
        error={createEvent.error}
        onClose={() => setFormDate(null)}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default CalendarPage;
