import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toDateInputValue } from '../../../lib/format';
import type { BabyProfile } from '../../../lib/types';
import { BABY_COLORS, BABY_COLOR_TOKENS } from '../../../lib/babyColors';
import { profileSchema, type ProfileFormData } from '../schemas';

interface BabyFormProps {
  /** The baby being edited, or `null` while adding one. */
  profile: BabyProfile | null;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onCancel: () => void;
  onSubmit: (values: ProfileFormData) => void;
}

/** The form's values for a profile, which is `null` while adding one. */
const formValues = (profile: BabyProfile | null): ProfileFormData => ({
  displayName: profile?.displayName ?? '',
  dateOfBirth: profile?.dateOfBirth ? toDateInputValue(new Date(profile.dateOfBirth)) : '',
  color: profile?.color ?? BABY_COLORS[0],
});

/**
 * Name, birth date and colour — everything a baby profile holds.
 *
 * A plain form, not a dialog: the manager decides where it appears, so the same
 * fields serve "add a baby" and "rename this one".
 */
const BabyForm = ({ profile, isPending, error, onCancel, onSubmit }: BabyFormProps) => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: formValues(profile),
  });

  // The manager swaps between "add" and "edit" without unmounting the form, so
  // it has to be told what it is editing now.
  useEffect(() => {
    form.reset(formValues(profile));
  }, [profile, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="baby-name" className="label">
          שם
        </label>
        <input
          id="baby-name"
          className={`input ${form.formState.errors.displayName ? 'input-error' : ''}`}
          {...form.register('displayName')}
        />
        {form.formState.errors.displayName && (
          <p className="mt-1 text-xs text-error">{form.formState.errors.displayName.message}</p>
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
          {...form.register('dateOfBirth')}
        />
      </div>

      {/* The colour is how a parent tells the twins apart on the timeline. */}
      <div role="group" aria-label="צבע">
        <span className="label">צבע</span>
        <div className="flex flex-wrap gap-3">
          {BABY_COLORS.map((color) => {
            const tokens = BABY_COLOR_TOKENS[color];
            const isActive = form.watch('color') === color;

            return (
              <button
                key={color}
                type="button"
                onClick={() => form.setValue('color', color, { shouldDirty: true })}
                aria-pressed={isActive}
                aria-label={tokens.label}
                title={tokens.label}
                className={`h-9 w-9 rounded-full transition-shadow ${tokens.dot} ${
                  isActive ? 'ring-2 ring-ink ring-offset-2' : 'hover:ring-2 hover:ring-border'
                }`}
              />
            );
          })}
        </div>
      </div>

      {Boolean(error) && (
        <p className="text-xs text-error" role="alert">
          {error instanceof Error ? error.message : 'השמירה נכשלה'}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
          {isPending ? 'שומר…' : 'שמירה'}
        </button>
        <button type="button" className="btn-secondary btn-sm" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </form>
  );
};

export default BabyForm;
