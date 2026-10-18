import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  IconBabyBottle,
  IconDroplets,
  IconFile,
  IconMoon,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react';
import { api } from '../../lib/api';
import { daysSince, formatDate, formatTime, toDateInputValue, toDateTimeInputValue } from '../../lib/format';
import Modal from '../../components/ui/Modal';
import DeleteButton from '../../components/ui/DeleteButton';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { BabyLog, BabyLogType, BabyProfile } from '../../lib/types';

const logTypes: Array<{ type: BabyLogType; icon: React.ComponentType<{ className?: string }>; label: string }> = [
  { type: 'FEEDING', icon: IconBabyBottle, label: 'הזנה' },
  { type: 'SLEEP', icon: IconMoon, label: 'שינה' },
  { type: 'DIAPER', icon: IconDroplets, label: 'חיתול' },
  { type: 'NOTE', icon: IconFile, label: 'הערה' },
];

const logSchema = z.object({
  type: z.enum(['FEEDING', 'SLEEP', 'DIAPER', 'NOTE']),
  occurredAt: z.string().min(1, 'נדרש מועד'),
  amountMl: z.string().optional(),
  durationMinutes: z.string().optional(),
  diaperType: z.enum(['', 'WET', 'DIRTY', 'BOTH']).optional(),
  note: z.string().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

const profileSchema = z.object({
  displayName: z.string().min(1, 'נדרש שם'),
  dateOfBirth: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function detailSummary(log: BabyLog): string[] {
  const parts: string[] = [];
  const details = (log.details ?? {}) as Record<string, unknown>;

  if (typeof details.amountMl === 'number') parts.push(`${details.amountMl} מ״ל`);
  if (typeof details.durationMinutes === 'number') parts.push(`${details.durationMinutes} דקות`);
  if (typeof details.diaperType === 'string') {
    const labels: Record<string, string> = { WET: 'רטוב', DIRTY: 'מלוכלך', BOTH: 'שניהם' };
    parts.push(labels[details.diaperType] ?? String(details.diaperType));
  }

  return parts;
}

export default function BabyPage() {
  const client = useQueryClient();
  const [activeTab, setActiveTab] = useState<'timeline' | 'add'>('timeline');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['baby', 'profile'],
    queryFn: async () =>
      (await api.get<{ data: BabyProfile | null }>('/api/v1/baby/profile')).data,
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['baby', 'logs'],
    queryFn: async () => (await api.get<{ data: BabyLog[] }>('/api/v1/baby/logs')).data ?? [],
  });

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['baby'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createLog = useMutation({
    mutationFn: (values: LogFormData) => {
      const details: Record<string, unknown> = {};
      if (values.type === 'FEEDING' && values.amountMl) details.amountMl = Number(values.amountMl);
      if (values.type === 'SLEEP' && values.durationMinutes) {
        details.durationMinutes = Number(values.durationMinutes);
      }
      if (values.type === 'DIAPER' && values.diaperType) details.diaperType = values.diaperType;

      return api.post('/api/v1/baby/logs', {
        type: values.type,
        occurredAt: new Date(values.occurredAt).toISOString(),
        note: values.note?.trim() || undefined,
        details: Object.keys(details).length > 0 ? details : undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      setActiveTab('timeline');
    },
  });

  const deleteLog = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/baby/logs/${id}`),
    onSuccess: invalidate,
  });

  const saveProfile = useMutation({
    mutationFn: (values: ProfileFormData) =>
      api.post('/api/v1/baby/profile', {
        displayName: values.displayName,
        dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth).toISOString() : undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsProfileOpen(false);
    },
  });

  const logForm = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: { type: 'FEEDING', occurredAt: toDateTimeInputValue() },
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: '', dateOfBirth: '' },
  });

  const openProfileForm = () => {
    profileForm.reset({
      displayName: profile?.displayName ?? '',
      dateOfBirth: profile?.dateOfBirth ? toDateInputValue(new Date(profile.dateOfBirth)) : '',
    });
    setIsProfileOpen(true);
  };

  const groupedLogs = useMemo(() => {
    const groups = new Map<string, BabyLog[]>();
    for (const log of logs ?? []) {
      const key = toDateInputValue(new Date(log.occurredAt));
      const list = groups.get(key) ?? [];
      list.push(log);
      groups.set(key, list);
    }
    return Array.from(groups.entries());
  }, [logs]);

  const ageInDays = profile?.dateOfBirth ? daysSince(profile.dateOfBirth) : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">שגרת התינוק</h1>
          <p className="text-sm text-ink-secondary">
            {profileLoading
              ? 'טוען…'
              : profile?.displayName
                ? `${profile.displayName}${ageInDays !== null ? ` · בן/בת ${ageInDays} ימים` : ''}`
                : 'הגדירו פרופיל תינוק כדי להתחיל'}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={openProfileForm}>
            <IconPencil className="h-4 w-4" />
            פרופיל
          </button>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => setActiveTab(activeTab === 'add' ? 'timeline' : 'add')}
          >
            <IconPlus className="h-4 w-4" />
            {activeTab === 'add' ? 'חזרה לציר הזמן' : 'רשום פעילות'}
          </button>
        </div>
      </div>

      {activeTab === 'add' ? (
        <div className="card">
          <h2 className="section-title mb-4">רשום פעילות חדשה</h2>
          <form
            onSubmit={logForm.handleSubmit(async (values) => {
              await createLog.mutateAsync(values);
              logForm.reset({ type: 'FEEDING', occurredAt: toDateTimeInputValue() });
            })}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {logTypes.map((item) => {
                const isActive = logForm.watch('type') === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => logForm.setValue('type', item.type)}
                    aria-pressed={isActive}
                    className={`flex flex-col items-center gap-2 rounded-8 border p-4 transition-colors ${
                      isActive
                        ? 'border-forest bg-sage-light text-forest'
                        : 'border-border bg-surface text-ink hover:bg-cream'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="log-occurred" className="label">
                  מועד
                </label>
                <input
                  id="log-occurred"
                  type="datetime-local"
                  className="input"
                  {...logForm.register('occurredAt')}
                />
                {logForm.formState.errors.occurredAt && (
                  <p className="mt-1 text-xs text-error">
                    {logForm.formState.errors.occurredAt.message}
                  </p>
                )}
              </div>

              {logForm.watch('type') === 'FEEDING' && (
                <div>
                  <label htmlFor="log-amount" className="label">
                    כמות (מ״ל)
                  </label>
                  <input
                    id="log-amount"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="input"
                    {...logForm.register('amountMl')}
                  />
                </div>
              )}

              {logForm.watch('type') === 'SLEEP' && (
                <div>
                  <label htmlFor="log-duration" className="label">
                    משך (דקות)
                  </label>
                  <input
                    id="log-duration"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    className="input"
                    {...logForm.register('durationMinutes')}
                  />
                </div>
              )}

              {logForm.watch('type') === 'DIAPER' && (
                <div>
                  <label htmlFor="log-diaper" className="label">
                    סוג
                  </label>
                  <select id="log-diaper" className="input" {...logForm.register('diaperType')}>
                    <option value="">לא צוין</option>
                    <option value="WET">רטוב</option>
                    <option value="DIRTY">מלוכלך</option>
                    <option value="BOTH">שניהם</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="log-note" className="label">
                הערה
              </label>
              <textarea id="log-note" rows={2} className="input" {...logForm.register('note')} />
            </div>

            {createLog.isError && (
              <p className="text-xs text-error" role="alert">
                {createLog.error instanceof Error ? createLog.error.message : 'שמירת הרשומה נכשלה'}
              </p>
            )}

            <button type="submit" className="btn-primary btn-sm" disabled={createLog.isPending}>
              {createLog.isPending ? 'שומר…' : 'שמירת רשומה'}
            </button>
          </form>
        </div>
      ) : logsLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (logs ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconBabyBottle}
            title="אין רשומות עדיין"
            description="התחילו לרשום את הפעילות הראשונה של התינוק"
            action={
              <button type="button" className="btn-primary btn-sm" onClick={() => setActiveTab('add')}>
                <IconPlus className="h-4 w-4" />
                רשום פעילות
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {groupedLogs.map(([day, dayLogs]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-semibold text-ink">{formatDate(day)}</h2>
              <ul className="space-y-2">
                {dayLogs.map((log) => {
                  const meta = logTypes.find((item) => item.type === log.type);
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
                        disabled={deleteLog.isPending}
                        onConfirm={() => deleteLog.mutate(log.id)}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Modal
        open={isProfileOpen}
        title="פרופיל התינוק/ת"
        onClose={() => setIsProfileOpen(false)}
        footer={
          <>
            <button
              type="submit"
              form="baby-profile-form"
              className="btn-primary btn-sm"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? 'שומר…' : 'שמירה'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setIsProfileOpen(false)}
            >
              ביטול
            </button>
          </>
        }
      >
        <form
          id="baby-profile-form"
          onSubmit={profileForm.handleSubmit((values) => saveProfile.mutateAsync(values))}
          className="space-y-4"
        >
          <div>
            <label htmlFor="baby-name" className="label">
              שם
            </label>
            <input
              id="baby-name"
              className={`input ${profileForm.formState.errors.displayName ? 'input-error' : ''}`}
              {...profileForm.register('displayName')}
            />
            {profileForm.formState.errors.displayName && (
              <p className="mt-1 text-xs text-error">
                {profileForm.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="baby-dob" className="label">
              תאריך לידה
            </label>
            <input
              id="baby-dob"
              type="date"
              className="input"
              max={toDateInputValue()}
              {...profileForm.register('dateOfBirth')}
            />
          </div>

          {saveProfile.isError && (
            <p className="text-xs text-error" role="alert">
              {saveProfile.error instanceof Error ? saveProfile.error.message : 'השמירה נכשלה'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
