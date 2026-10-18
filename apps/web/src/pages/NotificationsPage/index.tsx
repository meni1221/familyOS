import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useToast } from '../../hooks/useToast';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Notification } from '../../lib/types';
import NotificationList from './NotificationList';

const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await api.get<{ data: Notification[] }>('/api/v1/notifications');
  return response.data ?? [];
};

/**
 * The notification centre: the unread counter, "mark all" and the list. The
 * list lives next to this file.
 */
const NotificationsPage = () => {
  const client = useQueryClient();
  const toast = useToast();

  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['notifications'] });
    void client.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const markOne = useMutation({
    mutationFn: (id: string) => api.patch(`/api/v1/notifications/${id}/read`),
    onSuccess: invalidate,
  });

  const markAll = useMutation({
    mutationFn: () => api.post('/api/v1/notifications/read-all'),
    onSuccess: () => {
      invalidate();
      toast.success('כל ההתראות סומנו כנקראו');
    },
    onError: (error) => toast.error('סימון ההתראות נכשל', errorMessage(error)),
  });

  const unread = (notifications ?? []).filter((item) => !item.readAt).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={IconBell}
        title="שגיאה בטעינת התראות"
        description="נסו לרענן את הדף"
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">התראות</h1>
          {unread > 0 && <p className="text-sm text-ink-secondary">{unread} התראות שלא נקראו</p>}
        </div>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => markAll.mutate()}
          disabled={unread === 0 || markAll.isPending}
        >
          <IconCheck className="h-4 w-4" />
          סמן הכל כנקרא
        </button>
      </div>

      {markAll.isError && (
        <p className="mb-3 text-sm text-error" role="alert">
          {markAll.error instanceof Error ? markAll.error.message : 'העדכון נכשל'}
        </p>
      )}

      <NotificationList
        notifications={notifications ?? []}
        isMarking={markOne.isPending}
        onMarkRead={(id) => markOne.mutate(id)}
      />
    </div>
  );
};

export default NotificationsPage;
