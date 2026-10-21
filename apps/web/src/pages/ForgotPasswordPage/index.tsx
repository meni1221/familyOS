import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconMailForward } from '@tabler/icons-react';
import AuthCard from '../../components/layout/AuthCard';
import { useSeo } from '../../hooks/useSeo';
import { api, ApiError } from '../../lib/api';
import { forgotPasswordSchema, type ForgotPasswordFormData } from './schemas';

/**
 * "I forgot my password": asks for the address and always answers the same,
 * whether or not it has an account. The page cannot know either, and should
 * not be usable to find out.
 */
const ForgotPasswordPage = () => {
  useSeo({ title: 'שכחתי סיסמה', noIndex: true, path: '/forgot-password' });

  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError('');
    try {
      await api.post('/api/v1/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'שליחת הקישור נכשלה');
    }
  };

  if (sent) {
    return (
      <AuthCard
        title="בדקו את תיבת המייל"
        subtitle="אם הכתובת רשומה אצלנו, נשלח אליה קישור לאיפוס הסיסמה"
        error=""
      >
        <p className="text-sm text-ink-secondary">
          הקישור תקף לשעה אחת ומתבטל לאחר השימוש. אם הוא לא הגיע, בדקו את תיקיית הספאם או{' '}
          <button
            type="button"
            className="font-medium text-forest hover:underline"
            onClick={() => setSent(false)}
          >
            נסו שוב
          </button>
          .
        </p>

        <Link to="/login" className="btn-secondary mt-5 w-full">
          חזרה להתחברות
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="שכחתי סיסמה"
      subtitle="נשלח לכם קישור לקביעת סיסמה חדשה"
      error={error}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            אימייל
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <IconMailForward className="h-4 w-4" />
          {isSubmitting ? 'שולח…' : 'שליחת קישור'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-secondary">
        נזכרתם?{' '}
        <Link to="/login" className="font-medium text-forest hover:underline">
          חזרה להתחברות
        </Link>
      </p>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
