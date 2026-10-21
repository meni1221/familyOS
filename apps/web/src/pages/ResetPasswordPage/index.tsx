import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLock } from '@tabler/icons-react';
import AuthCard from '../../components/layout/AuthCard';
import { useSeo } from '../../hooks/useSeo';
import { api, ApiError } from '../../lib/api';
import { resetPasswordSchema, type ResetPasswordFormData } from './schemas';

/**
 * The other half of the reset mail: the token from the link, and a new
 * password. On success the server has already signed every old session out,
 * so the page sends the person to a fresh login rather than into the app.
 */
const ResetPasswordPage = () => {
  useSeo({ title: 'סיסמה חדשה', noIndex: true, path: '/reset-password' });

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError('');
    try {
      await api.post('/api/v1/auth/reset-password', { token, password: data.password });
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'איפוס הסיסמה נכשל');
    }
  };

  if (!token) {
    return (
      <AuthCard title="קישור לא תקין" subtitle="הקישור שבו הגעתם אינו כולל אסימון לאיפוס" error="">
        <p className="text-sm text-ink-secondary">
          ייתכן שהקישור נחתך בדואר. אפשר לבקש קישור חדש — הוא תקף לשעה.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-5 w-full">
          בקשת קישור חדש
        </Link>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="הסיסמה עודכנה" subtitle="אפשר להתחבר עם הסיסמה החדשה" error="">
        <p className="text-sm text-ink-secondary">
          כל ההתחברויות הקודמות לחשבון נותקו, כדי שאף אחד לא יישאר מחובר עם הסיסמה הישנה.
        </p>
        <Link to="/login" className="btn-primary mt-5 w-full">
          התחברות
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="קביעת סיסמה חדשה"
      subtitle="בחרו סיסמה חדשה לחשבון שלכם"
      error={error}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="label">
            סיסמה חדשה
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            אימות סיסמה
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <IconLock className="h-4 w-4" />
          {isSubmitting ? 'מעדכן…' : 'עדכון הסיסמה'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-secondary">
        <Link to="/forgot-password" className="font-medium text-forest hover:underline">
          בקשת קישור חדש
        </Link>
      </p>
    </AuthCard>
  );
};

export default ResetPasswordPage;
