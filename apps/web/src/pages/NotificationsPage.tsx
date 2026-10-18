import { IconBell, IconCheck } from '@tabler/icons-react';
import EmptyState from '../components/ui/EmptyState';

export default function NotificationsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">התראות</h1>
        <button className="btn-secondary btn-sm">
          <IconCheck className="h-4 w-4" />
          סמן הכל כנקרא
        </button>
      </div>

      <div className="card">
        <EmptyState
          icon={IconBell}
          title="אין התראות"
          description="כשיהיו התראות חדשות, הן יופיעו כאן"
        />
      </div>
    </div>
  );
}
