import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconUserPlus } from '@tabler/icons-react';
import AuthCard from '../../components/layout/AuthCard';
import { api, ApiError } from '../../lib/api';
import type { AuthUser } from '../../hooks/useAuth';
import { registerSchema, type RegisterFormData } from './schemas';

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    try {
      const result = await api.post<{ user: AuthUser }>('/api/v1/auth/register', {
        displayName: data.displayName,
        email: data.email,
        password: data.password,
      });

      // Seed the auth cache before navigating, otherwise `ProtectedRoute` still
      // sees the cached anonymous session and sends the user back to /login.
      queryClient.setQueryData(['auth'], result.user);
      navigate('/app');
    } catch (err) {
      // `ApiError` carries the server's Hebrew message (e.g. the 409 for an
      // address that is already registered).
      setError(err instanceof ApiError ? err.message : 'שגיאה בהרשמה');
    }
  };

  return (
    <AuthCard title="הרשמה" subtitle="צרו חשבון והתחילו לנהל את המשפחה" error={error}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="label">
            שם מלא
          </label>
          <input
            id="displayName"
            type="text"
            className={`input ${errors.displayName ? 'input-error' : ''}`}
            placeholder="ישראל ישראלי"
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
            type="email"
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            className={`input ${errors.password ? 'input-error' : ''}`}
            placeholder="לפחות 8 תווים"
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
            className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
            placeholder="וודאו את הסיסמה"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <IconUserPlus className="h-4 w-4" />
          {isSubmitting ? 'נרשם...' : 'הרשמה'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-secondary">
        כבר יש לכם חשבון?{' '}
        <Link to="/login" className="font-medium text-forest hover:underline">
          התחברו
        </Link>
      </p>
    </AuthCard>
  );
}
