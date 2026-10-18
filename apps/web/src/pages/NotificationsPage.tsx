import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconChecklist,
  IconCoin,
  IconInfoCircle,
} from '@tabler/icons-react';
import { api } from '../lib/api';
import { formatDateTime } from '../lib/format';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  readAt?: string | null;
  createdAt: string;
}

async function fetchNotifications(): Promise<Notification[]> {
  const response = await api.get<{ data: Notification[] }>('/api/v1/notifications');
  return response.data ?? [];
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  TASK_ASSIGNED: IconChecklist,
  TASK_DUE_SOON: IconChecklist,
  EVENT_REMINDER: IconCalendar,
  EXPENSE_ADDED: IconCoin,
  WEEKLY_SUMMARY: IconInfoCircle,
};

export default function NotificationsPage() {
  const client = useQueryClient();

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
    onSuccess: invalidate,
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
          {unread > 0 && (
            <p className="text-sm text-ink-secondary">{unread} התראות שלא נקראו</p>
          )}
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

      {(notifications ?? []).length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconBell}
            title="אין התראות"
            description="כשיהיו התראות חדשות, הן יופיעו כאן"
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {(notifications ?? []).map((notification) => {
            const Icon = typeIcons[notification.type] ?? IconBell;
            const isUnread = !notification.readAt;

            return (
              <li
                key={notification.id}
                className={`card flex items-start gap-3 py-3 ${
                  isUnread ? 'border-forest/40' : ''
                }`}
              >
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isUnread ? 'bg-sage-light text-forest' : 'bg-cream text-ink-secondary'
                  }`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{notification.title}</p>
                  {notification.message && (
                    <p className="break-words text-sm text-ink-secondary">
                      {notification.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink-secondary">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>

                {isUnread && (
                  <button
                    type="button"
                    className="btn-ghost btn-sm shrink-0"
                    onClick={() => markOne.mutate(notification.id)}
                    disabled={markOne.isPending}
                  >
                    סמן כנקרא
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
