import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  IconBabyBottle,
  IconBell,
  IconCalendar,
  IconCheck,
  IconPlus,
  IconWallet,
} from '@tabler/icons-react';

interface QuickAction {
  to: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { to: '/app/tasks', icon: IconCheck, label: 'הוסף משימה' },
  { to: '/app/calendar', icon: IconCalendar, label: 'הוסף אירוע' },
  { to: '/app/baby', icon: IconBabyBottle, label: 'רשום פעילות' },
  { to: '/app/budget', icon: IconWallet, label: 'הוסף הוצאה' },
  { to: '/app/documents', icon: IconPlus, label: 'העלה מסמך' },
  { to: '/app/notifications', icon: IconBell, label: 'התראות' },
];

/** The six shortcuts under the dashboard cards. */
export default function QuickActions() {
  return (
    <div className="mt-6">
      <h2 className="section-title mb-3">פעולות מהירות</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="card flex flex-col items-center gap-2 py-4 text-center transition-colors hover:bg-cream"
          >
            <action.icon className="h-5 w-5 text-forest" />
            <span className="text-xs font-medium text-ink">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
