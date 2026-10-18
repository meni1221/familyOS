import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconLogin } from '@tabler/icons-react';
import BrandLogo from '../components/ui/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נדרש סיסמה'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
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
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message ?? 'שגיאה בהתחברות');
        return;
      }
      navigate('/app');
    } catch {
      setError('שגיאת רשת. נסו שוב.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <BrandLogo to="/" size="md" />
        </div>
        <div className="card">
          <h1 className="mb-1 text-center text-xl font-bold text-ink">התחברות</h1>
          <p className="mb-6 text-center text-sm text-ink-secondary">
            הזינו את הפרטים שלכם כדי להיכנס למשפחה
          </p>
          {error && (
            <div className="mb-4 rounded-4 bg-red-50 p-3 text-sm text-error">
              {error}
            </div>
          )}
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
              {errors.email && (
                <p className="mt-1 text-xs text-error">{errors.email.message}</p>
              )}
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
              {errors.password && (
                <p className="mt-1 text-xs text-error">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
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
        </div>
      </div>
    </div>
  );
}
