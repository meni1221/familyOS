import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toDateTimeInputValue } from '../../../lib/format';
import { LOG_TYPES } from '../../../lib/babyLogTypes';
import type { BabyProfile } from '../../../lib/types';
import { logSchema, type LogFormData } from '../schemas';

interface BabyLogFormProps {
  /** The babies a log can be recorded for; empty until one exists. */
  profiles: BabyProfile[];
  /** The baby the form starts on — the one the timeline is showing. */
  defaultBabyProfileId: string;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  /** Resolves on success; the form clears itself only then. */
  onSubmit: (values: LogFormData) => Promise<unknown>;
}

/** Records one event: feeding, sleep, diaper or a plain note. */
const BabyLogForm = ({
  profiles,
  defaultBabyProfileId,
  isPending,
  error,
  onSubmit,
}: BabyLogFormProps) => {
  const emptyForm = (): LogFormData => ({
    type: 'FEEDING',
    babyProfileId: defaultBabyProfileId,
    occurredAt: toDateTimeInputValue(),
  });

  const form = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: emptyForm(),
  });

  const submit = async (values: LogFormData) => {
    await onSubmit(values);
    form.reset(emptyForm());
  };

  return (
    <div className="card">
      <h2 className="section-title mb-4">רשום פעילות חדשה</h2>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
        {/* With one baby there is nothing to choose; with twins there is. */}
        {profiles.length > 0 && (
          <div>
            <label htmlFor="log-baby" className="label">
              תינוק/ת
            </label>
            <select id="log-baby" className="input" {...form.register('babyProfileId')}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LOG_TYPES.map((item) => {
            const isActive = form.watch('type') === item.type;
            return (
              <button
                key={item.type}
                type="button"
                onClick={() => form.setValue('type', item.type)}
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
              {...form.register('occurredAt')}
            />
            {form.formState.errors.occurredAt && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.occurredAt.message}</p>
            )}
          </div>

          {form.watch('type') === 'FEEDING' && (
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
                {...form.register('amountMl')}
              />
            </div>
          )}

          {form.watch('type') === 'SLEEP' && (
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
                {...form.register('durationMinutes')}
              />
            </div>
          )}

          {form.watch('type') === 'DIAPER' && (
            <div>
              <label htmlFor="log-diaper" className="label">
                סוג
              </label>
              <select id="log-diaper" className="input" {...form.register('diaperType')}>
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
          <textarea id="log-note" rows={2} className="input" {...form.register('note')} />
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'שמירת הרשומה נכשלה'}
          </p>
        )}

        <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
          {isPending ? 'שומר…' : 'שמירת רשומה'}
        </button>
      </form>
    </div>
  );
};

export default BabyLogForm;
