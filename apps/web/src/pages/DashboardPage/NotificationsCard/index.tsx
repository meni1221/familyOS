import { IconBell } from '@tabler/icons-react';
import DashboardCard from '../DashboardCard';

interface NotificationsCardProps {
  unreadCount: number;
}

/** How many notifications are still unread. */
export default function NotificationsCard({ unreadCount }: NotificationsCardProps) {
  return (
    <DashboardCard title="התראות" to="/app/notifications">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
          <IconBell className="h-5 w-5 text-forest" />
        </div>
        <div>
          <p className="text-2xl font-bold text-ink">{unreadCount}</p>
          <p className="text-xs text-ink-secondary">התראות לא נקראו</p>
        </div>
      </div>
    </DashboardCard>
  );
}
