import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLogin } from '@tabler/icons-react';
import AuthCard from '../../components/layout/AuthCard';
import { useSeo } from '../../hooks/useSeo';
import { api, ApiError } from '../../lib/api';
import type { AuthUser } from '../../hooks/useAuth';
import { loginSchema, type LoginFormData } from './schemas';

export default function LoginPage() {
  useSeo({ title: 'התחברות', noIndex: true, path: '/login' });

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    try {
      const result = await api.post<{ user: AuthUser }>('/api/v1/auth/login', data);

      // Seed the auth cache before navigating: `ProtectedRoute` reads it
      // immediately, and a stale `null` would bounce the user back here.
      queryClient.setQueryData(['auth'], result.user);
      navigate('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'שגיאה בהתחברות');
    }
  };

  return (
    <AuthCard title="התחברות" subtitle="הזינו את הפרטים שלכם כדי להיכנס למשפחה" error={error}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          <IconLogin className="h-4 w-4" />
          {isSubmitting ? 'מתחבר...' : 'התחברות'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-secondary">
        אין לכם חשבון?{' '}
        <Link to="/register" className="font-medium text-forest hover:underline">
          הירשמו
        </Link>
      </p>
    </AuthCard>
  );
}
