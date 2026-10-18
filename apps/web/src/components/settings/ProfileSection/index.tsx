import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconUser } from '@tabler/icons-react';
import SectionCard from '../SectionCard';
import { useProfile, useUpdateProfile } from '../../../hooks/useSettings';
import { applyLocale, LOCALE_LABELS } from '../../../lib/locale';
import type { Locale } from '../../../lib/types';

const TIMEZONE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'Asia/Jerusalem', label: 'ירושלים (Asia/Jerusalem)' },
  { value: 'Europe/London', label: 'לונדון (Europe/London)' },
  { value: 'Europe/Paris', label: 'פריז (Europe/Paris)' },
  { value: 'Europe/Berlin', label: 'ברלין (Europe/Berlin)' },
  { value: 'America/New_York', label: 'ניו יורק (America/New_York)' },
  { value: 'America/Los_Angeles', label: 'לוס אנג׳לס (America/Los_Angeles)' },
  { value: 'UTC', label: 'UTC' },
];

const schema = z.object({
  displayName: z.string().min(2, 'שם חייב להכיל לפחות 2 תווים'),
  timezone: z.string().min(1, 'נדרש אזור זמן'),
  preferredLocale: z.enum(['he', 'en']),
});

type ProfileFormData = z.infer<typeof schema>;

export default function ProfileSection() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ProfileFormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!profile) return;
    reset({
      displayName: profile.displayName,
      timezone: profile.timezone,
      preferredLocale: profile.preferredLocale,
    });
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormData) => {
    await updateProfile.mutateAsync(values);
    // Keep the document direction/formatting in sync with the saved language.
    applyLocale(values.preferredLocale as Locale);
  };

  const timezones = profile?.timezone
    ? TIMEZONE_OPTIONS.some((option) => option.value === profile.timezone)
      ? TIMEZONE_OPTIONS
      : [{ value: profile.timezone, label: profile.timezone }, ...TIMEZONE_OPTIONS]
    : TIMEZONE_OPTIONS;

  return (
    <SectionCard title="פרופיל" description="השם, השפה ואזור הזמן שלכם" icon={IconUser}>
      {isLoading ? (
        <p className="text-sm text-ink-secondary">טוען…</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="label">
              שם מלא
            </label>
            <input
              id="displayName"
              className={`input ${errors.displayName ? 'input-error' : ''}`}
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-error">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="label">
              אימייל
            </label>
            <input
              id="email"
              className="input bg-cream"
              value={profile?.email ?? ''}
              readOnly
              disabled
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="mt-1 text-xs text-ink-secondary">
              כתובת האימייל מזוהה עם החשבון ואינה ניתנת לשינוי
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="preferredLocale" className="label">
                שפה
              </label>
              <select id="preferredLocale" className="input" {...register('preferredLocale')}>
                {(Object.keys(LOCALE_LABELS) as Locale[]).map((locale) => (
                  <option key={locale} value={locale}>
                    {LOCALE_LABELS[locale]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="timezone" className="label">
                אזור זמן
              </label>
              <select id="timezone" className="input" {...register('timezone')}>
                {timezones.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary btn-sm" disabled={isSubmitting}>
              {isSubmitting ? 'שומר…' : 'שמירת שינויים'}
            </button>

            {isSubmitSuccessful && !isSubmitting && (
              <span className="text-xs text-success" role="status">
                השינויים נשמרו
              </span>
            )}
            {updateProfile.isError && (
              <span className="text-xs text-error" role="alert">
                {updateProfile.error instanceof Error
                  ? updateProfile.error.message
                  : 'השמירה נכשלה'}
              </span>
            )}
          </div>
        </form>
      )}
    </SectionCard>
  );
}
