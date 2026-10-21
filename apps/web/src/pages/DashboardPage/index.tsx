import { useQuery } from '@tanstack/react-query';
import { IconPlus, IconSparkles } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { DashboardPayload } from '../../lib/types';
import TasksCard from './TasksCard';
import EventsCard from './EventsCard';
import NotificationsCard from './NotificationsCard';
import BudgetCard from './BudgetCard';
import BabyCard from './BabyCard';
import QuickActions from './QuickActions';

const fetchDashboard = async (): Promise<DashboardPayload> => {
  return api.get<DashboardPayload>('/api/v1/dashboard');
};

/**
 * The first screen after login: what is due, what is happening, and shortcuts.
 * Each card lives next to this file.
 */
const DashboardPage = () => {
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
        <TasksCard tasks={data?.tasks.today ?? []} overdueCount={data?.tasks.overdue.length ?? 0} />
        <EventsCard events={data?.events.today ?? []} />
        <NotificationsCard unreadCount={data?.notifications.unreadCount ?? 0} />
        <BudgetCard budget={data?.budget} />
        <BabyCard babyLogs={data?.babyLogs ?? { recent: [], profiles: [] }} />
      </div>

      <QuickActions />
    </div>
  );
};

export default DashboardPage;
