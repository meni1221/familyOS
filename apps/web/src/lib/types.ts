/**
 * Single import surface for the web app's API types.
 *
 * The canonical definitions live in `@familyos/shared-types` so the API and the
 * web client cannot drift apart; anything purely presentational is added here.
 */
export type {
  BabyLog,
  BabyLogType,
  BabyProfile,
  Budget,
  CalendarEvent,
  Currency,
  CurrentFamily,
  DashboardData,
  Document as FamilyDocument,
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
} from '@familyos/shared-types';

import type { DashboardData as SharedDashboardData, Expense as SharedExpense } from '@familyos/shared-types';

/** Envelope used by every list endpoint. */
export interface ListResponse<T> {
  data: T[];
}

/** `GET /api/v1/dashboard` — the shared shape plus the recent-expense list. */
export interface DashboardPayload
  extends Omit<SharedDashboardData, 'budget'> {
  budget: SharedDashboardData['budget'] & { recentExpenses: SharedExpense[] };
}
