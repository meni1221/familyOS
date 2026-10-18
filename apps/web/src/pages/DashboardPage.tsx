import { useQuery } from '@tanstack/react-query';
import {
  IconCheck,
  IconCalendar,
  IconBabyBottle,
  IconWallet,
  IconBell,
  IconPlus,
  IconSparkles,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface DashboardData {
  tasks: {
    today: Array<{ id: string; title: string; status: string; priority: string }>;
    overdue: Array<{ id: string; title: string; dueAt: string }>;
  };
  events: {
    today: Array<{ id: string; title: string; startsAt: string }>;
  };
  notifications: {
    unreadCount: number;
  };
}

async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/v1/dashboard', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch dashboard');
  return res.json();
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
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
        icon={IconSparkles}
        title="שגיאה בטעינת הנתונים"
        description="נסו לרענן את הדף"
      />
    );
  }

  const today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">סקירה כללית</h1>
          <p className="text-sm text-ink-secondary">{today}</p>
        </div>
        <Link to="/app/tasks" className="btn-primary btn-sm">
          <IconPlus className="h-4 w-4" />
          משימה חדשה
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">משימות שלי היום</h2>
            <Link to="/app/tasks" className="text-xs text-forest hover:underline">
              הצג הכל
            </Link>
          </div>
          {data?.tasks?.today?.length ? (
            <ul className="space-y-2">
              {data.tasks.today.slice(0, 3).map((task) => (
                <li key={task.id} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-forest" />
                  <span className="text-sm text-ink">{task.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-secondary">אין משימות להיום</p>
          )}
        </div>

        {/* Today's Events */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">אירועים היום</h2>
            <Link to="/app/calendar" className="text-xs text-forest hover:underline">
              הצג הכל
            </Link>
          </div>
          {data?.events?.today?.length ? (
            <ul className="space-y-2">
              {data.events.today.slice(0, 3).map((event) => (
                <li key={event.id} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                  <span className="text-sm text-ink">{event.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-secondary">אין אירועים להיום</p>
          )}
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">התראות</h2>
            <Link to="/app/notifications" className="text-xs text-forest hover:underline">
              הצג הכל
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-light">
              <IconBell className="h-5 w-5 text-forest" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">{data?.notifications?.unreadCount ?? 0}</p>
              <p className="text-xs text-ink-secondary">התראות לא נקראו</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="section-title mb-3">פעולות מהירות</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { to: '/app/tasks', icon: IconCheck, label: 'הוסף משימה' },
            { to: '/app/calendar', icon: IconCalendar, label: 'הוסף אירוע' },
            { to: '/app/baby', icon: IconBabyBottle, label: 'רשום פעילות' },
            { to: '/app/budget', icon: IconWallet, label: 'הוסף הוצאה' },
            { to: '/app/documents', icon: IconPlus, label: 'העלה מסמך' },
            { to: '/app/notifications', icon: IconBell, label: 'התראות' },
          ].map((action) => (
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
    </div>
  );
}
