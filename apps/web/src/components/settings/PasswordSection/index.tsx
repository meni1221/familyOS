import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconShield } from '@tabler/icons-react';
import SectionCard from '../SectionCard';
import { useChangePassword } from '../../../hooks/useSettings';
import { useToast } from '../../../hooks/useToast';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'נדרשת הסיסמה הנוכחית'),
    newPassword: z.string().min(8, 'סיסמה צריכה להכיל לפחות 8 תווים'),
    confirmPassword: z.string().min(1, 'נדרש אימות סיסמה'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'הסיסמאות אינן תואמות',
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    path: ['newPassword'],
    message: 'הסיסמה החדשה חייבת להיות שונה מהנוכחית',
  });

type PasswordFormData = z.infer<typeof schema>;

export default function PasswordSection() {
  const changePassword = useChangePassword();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: PasswordFormData) => {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('הסיסמה עודכנה');
  };

  return (
    <SectionCard
      title="אבטחה"
      description="שינוי הסיסמה של החשבון"
      icon={IconShield}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="label">
            סיסמה נוכחית
          </label>
          <input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            className={`input ${errors.currentPassword ? 'input-error' : ''}`}
            {...register('currentPassword')}
          />
          {errors.currentPassword && (
            <p className="mt-1 text-xs text-error">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="newPassword" className="label">
              סיסמה חדשה
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={`input ${errors.newPassword ? 'input-error' : ''}`}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-error">{errors.newPassword.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="label">
              אימות הסיסמה החדשה
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary btn-sm" disabled={isSubmitting}>
            {isSubmitting ? 'מעדכן…' : 'עדכון סיסמה'}
          </button>

          {changePassword.isError && (
            <span className="text-xs text-error" role="alert">
              {changePassword.error instanceof Error
                ? changePassword.error.message
                : 'עדכון הסיסמה נכשל'}
            </span>
          )}
        </div>
      </form>
    </SectionCard>
  );
}
