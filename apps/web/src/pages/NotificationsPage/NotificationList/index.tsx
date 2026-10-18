import { IconBell } from '@tabler/icons-react';
import EmptyState from '../../../components/ui/EmptyState';
import { formatDateTime } from '../../../lib/format';
import type { Notification } from '../../../lib/types';
import { notificationIcon } from '../typeIcons';

interface NotificationListProps {
  notifications: Notification[];
  /** A read receipt is in flight. */
  isMarking: boolean;
  onMarkRead: (id: string) => void;
}

/** The notifications, unread ones marked and each with its own mark-read. */
export default function NotificationList({
  notifications,
  isMarking,
  onMarkRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="card">
        <EmptyState
          icon={IconBell}
          title="אין התראות"
          description="כשיהיו התראות חדשות, הן יופיעו כאן"
        />
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((notification) => {
        const Icon = notificationIcon(notification.type);
        const isUnread = !notification.readAt;

        return (
          <li
            key={notification.id}
            className={`card flex items-start gap-3 py-3 ${isUnread ? 'border-forest/40' : ''}`}
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
                <p className="break-words text-sm text-ink-secondary">{notification.message}</p>
              )}
              <p className="mt-1 text-xs text-ink-secondary">
                {formatDateTime(notification.createdAt)}
              </p>
            </div>

            {isUnread && (
              <button
                type="button"
                className="btn-ghost btn-sm shrink-0"
                onClick={() => onMarkRead(notification.id)}
                disabled={isMarking}
              >
                סמן כנקרא
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
