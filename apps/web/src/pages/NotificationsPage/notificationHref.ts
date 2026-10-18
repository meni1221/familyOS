import type { Notification, NotificationType } from '../../lib/types';

/**
 * Where a notification leads, keyed by the entity the backend recorded on it.
 * The entity wins over the notification type because it is the more precise of
 * the two.
 */
const ENTITY_ROUTES: Record<string, string> = {
  Task: '/app/tasks',
  CalendarEvent: '/app/calendar',
  Event: '/app/calendar',
  Budget: '/app/budget',
  Expense: '/app/budget',
  Document: '/app/documents',
  BabyProfile: '/app/baby',
  BabyLog: '/app/baby',
  Invitation: '/app/settings',
};

/** Fallback for notifications that carry no entity, such as older records. */
const TYPE_ROUTES: Partial<Record<NotificationType, string>> = {
  TASK_ASSIGNED: '/app/tasks',
  TASK_DUE_SOON: '/app/tasks',
  EVENT_REMINDER: '/app/calendar',
  EXPENSE_ADDED: '/app/budget',
  DOCUMENT_EXPIRING: '/app/documents',
  INVITATION: '/app/settings',
  WEEKLY_SUMMARY: '/app',
};

/** Screens that can bring a single item into view through `?focus=<id>`. */
const FOCUSABLE_ROUTES = new Set(['/app/tasks']);

/**
 * The in-app destination of a notification, or `null` when the notification
 * only lives in the list itself (a system message, for instance).
 */
export const notificationHref = (notification: Notification): string | null => {
  const route =
    (notification.relatedEntityType && ENTITY_ROUTES[notification.relatedEntityType]) ||
    TYPE_ROUTES[notification.type] ||
    null;

  if (!route) return null;

  const { relatedEntityId } = notification;
  if (relatedEntityId && FOCUSABLE_ROUTES.has(route)) {
    return `${route}?focus=${encodeURIComponent(relatedEntityId)}`;
  }

  return route;
};
