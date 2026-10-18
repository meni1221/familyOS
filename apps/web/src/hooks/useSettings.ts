import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { NotificationPreferences, UserProfile } from '../lib/types';

/** The signed-in user's settings (never contains password material). */
export const useProfile = () => {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: async () =>
      (await api.get<{ data: UserProfile }>('/api/v1/settings/profile')).data,
  });
};

/** Updates the display name, timezone and/or preferred language. */
export const useUpdateProfile = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Pick<UserProfile, 'displayName' | 'timezone' | 'preferredLocale'>>) =>
      api.patch<{ data: UserProfile }>('/api/v1/settings/profile', payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['settings', 'profile'] });
      // The header renders the display name from `/auth/me`.
      void client.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

/** Updates the language/timezone and merges individual notification toggles. */
export const useUpdatePreferences = () => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      preferredLocale?: 'he' | 'en';
      timezone?: string;
      notificationPreferences?: Partial<NotificationPreferences>;
    }) => api.patch<{ data: UserProfile }>('/api/v1/settings/preferences', payload),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['settings', 'profile'] });
      void client.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

/** Changes the password after verifying the current one. */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.post<{ success: boolean }>('/api/v1/settings/password', payload),
  });
};
