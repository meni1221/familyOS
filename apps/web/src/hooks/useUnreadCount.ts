import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Unread notification count for the header badge.
 *
 * Uses the `['notifications', 'unread']` key that the realtime layer already
 * invalidates on `notification:created` / `notification:read`.
 */
export function useUnreadCount(): number {
  const { data } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => api.get<{ count: number }>('/api/v1/notifications/unread-count'),
    staleTime: 30_000,
  });

  return data?.count ?? 0;
}
