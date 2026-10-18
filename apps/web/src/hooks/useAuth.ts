import { useQuery } from '@tanstack/react-query';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
    preferredLocale: 'he' | 'en';
  } | null;
}

export function useAuth(): AuthState {
  const { data, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/auth/me', {
          credentials: 'include',
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    isAuthenticated: !!data,
    isLoading,
    user: data ?? null,
  };
}
