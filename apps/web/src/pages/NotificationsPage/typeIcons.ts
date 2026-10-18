import type { ComponentType } from 'react';
import {
  IconBell,
  IconCalendar,
  IconChecklist,
  IconCoin,
  IconInfoCircle,
} from '@tabler/icons-react';
const TYPE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  TASK_ASSIGNED: IconChecklist,
  TASK_DUE_SOON: IconChecklist,
  EVENT_REMINDER: IconCalendar,
  EXPENSE_ADDED: IconCoin,
  WEEKLY_SUMMARY: IconInfoCircle,
};

/** Icon for a notification type, falling back to the plain bell. */
export function notificationIcon(type: string): ComponentType<{ className?: string }> {
  return TYPE_ICONS[type] ?? IconBell;
}
