import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IconBell, IconCheck } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useToast } from '../../hooks/useToast';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import EmptyState from '../../components/ui/EmptyState';
import LoadMore from '../../components/ui/LoadMore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Notification, Page } from '../../lib/types';
import NotificationList from './NotificationList';

const NOTIFICATIONS_PAGE_SIZE = 30;

const fetchNotificationPage = async (offset: number): Promise<Page<Notification>> => {
  const params = new URLSearchParams({
    limit: String(NOTIFICATIONS_PAGE_SIZE),
    offset: String(offset),
  });
  return api.get<Page<Notification>>(`/api/v1/notifications?${params.toString()}`);
};

/**
 * The notification centre: the unread counter, "mark all" and the list. The
 * counter is the server's, so it counts the notifications that are not loaded
 * yet as well.
 */
const NotificationsPage = () => {
  const client = useQueryClient();
  const toast = useToast();

  const {
    data: pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => fetchNotificationPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * NOTIFICATIONS_PAGE_SIZE : undefined,
  });

  const notifications = pages?.pages.flatMap((page) => page.data) ?? [];
  const unread = useUnreadCount();

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['notifications'] });
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
        notifications={notifications}
        isMarking={markOne.isPending}
        onMarkRead={(id) => markOne.mutate(id)}
      />

      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onClick={() => void fetchNextPage()}
        label="עוד התראות"
      />
    </div>
  );
};

export default NotificationsPage;
