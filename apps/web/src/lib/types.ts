/**
 * Single import surface for the web app's API types.
 *
 * The canonical definitions live in `@shlanu/shared-types` so the API and the
 * web client cannot drift apart; anything purely presentational is added here.
 */
export type {
  BabyColor,
  BabyLog,
  BabyLogType,
  BabyProfile,
  Budget,
  CalendarEvent,
  Currency,
  CurrentFamily,
  DashboardData,
  Expense,
  FamilyInvitation,
  FamilyMember,
  Family,
  InvitationStatus,
  Locale,
  Notification,
  NotificationPreferences,
  NotificationType,
  Task,
  TaskPriority,
  TaskStatus,
  UserProfile,
  UserRole,
} from '@shlanu/shared-types';

import type { DashboardData as SharedDashboardData, Expense as SharedExpense } from '@shlanu/shared-types';

/** Envelope used by every list endpoint. */
export interface ListResponse<T> {
  data: T[];
}

/**
 * A page of a paginated list. `hasMore` is the server's answer to "is there
 * another page?", so the client never has to ask for an empty one to find out.
 */
export interface Page<T> {
  data: T[];
  hasMore: boolean;
}

/** `GET /api/v1/dashboard` — the shared shape plus the recent-expense list. */
export interface DashboardPayload
  extends Omit<SharedDashboardData, 'budget'> {
  budget: SharedDashboardData['budget'] & { recentExpenses: SharedExpense[] };
}
