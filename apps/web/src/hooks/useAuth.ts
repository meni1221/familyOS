import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  preferredLocale: 'he' | 'en';
  familyId?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  refetch: () => void;
}

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    return await api.get<AuthUser | null>('/api/v1/auth/me');
  } catch {
    // Not signed in (or the API is briefly unreachable): treat as anonymous.
    return null;
  }
}

export function useAuth(): AuthState {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchCurrentUser,
    staleTime: 1000 * 60 * 5,
  });

  return {
    isAuthenticated: !!data,
    isLoading,
    user: data ?? null,
    refetch: () => {
      void refetch();
    },
  };
}

/** Ends the session server-side and drops every cached query. */
export function useLogout() {
  const client = useQueryClient();

  return async () => {
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // Even if the call fails the local session is gone as far as the UI cares;
      // `clear()` below still forces a fresh `/auth/me` check.
    } finally {
      client.clear();
    }
  };
}
