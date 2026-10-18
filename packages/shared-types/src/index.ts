// Shared types for FamilyOS

export type Locale = 'he' | 'en';
export type Direction = 'rtl' | 'ltr';
export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP';

export type UserRole = 'OWNER' | 'MEMBER';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type BabyLogType = 'FEEDING' | 'SLEEP' | 'DIAPER' | 'NOTE';
export type FeedingType = 'BREAST' | 'BOTTLE' | 'SOLID';
export type DiaperType = 'WET' | 'DIRTY' | 'BOTH';
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'EVENT_REMINDER'
  | 'EXPENSE_ADDED'
  | 'WEEKLY_SUMMARY'
  | 'INVITATION'
  | 'DOCUMENT_EXPIRING'
  | 'SYSTEM';

export interface User {
  id: string;
  email: string;
  displayName: string;
  preferredLocale: Locale;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  defaultLocale: Locale;
  defaultCurrency: Currency;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMembership {
  id: string;
  familyId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
}

/** A member of the active family, as returned by `GET /api/v1/families/members`. */
export interface FamilyMember {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  isYou: boolean;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

/** A pending/accepted/expired invitation for the active family. */
export interface FamilyInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

/** `GET /api/v1/families/current`. */
export interface CurrentFamily {
  id: string;
  name: string;
  defaultCurrency: Currency;
  defaultLocale: Locale;
  timezone: string;
  memberCount: number;
}

/** Which notifications a member wants to receive. */
export interface NotificationPreferences {
  taskAssigned: boolean;
  taskDueSoon: boolean;
  eventReminder: boolean;
  expenseAdded: boolean;
  weeklySummary: boolean;
  email: boolean;
}

/** `GET/PATCH /api/v1/settings/profile` — never includes password material. */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredLocale: Locale;
  timezone: string;
  notificationPreferences: NotificationPreferences;
  createdAt: string;
}

export interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  assigneeUserId?: string;
  dueAt?: string;
  completedAt?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  timezone: string;
  location?: string;
  category?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BabyProfile {
  id: string;
  familyId: string;
  displayName: string;
  dateOfBirth?: string;
  trackingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BabyLog {
  id: string;
  familyId: string;
  babyProfileId: string;
  type: BabyLogType;
  occurredAt: string;
  endedAt?: string;
  details?: Record<string, unknown>;
  note?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  familyId: string;
  name: string;
  amount: number;
  currency: Currency;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  familyId: string;
  amount: number;
  currency: Currency;
  category: string;
  description?: string;
  occurredAt: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  category: string;
  /** Original filename as uploaded by the user. */
  originalName?: string;
  contentType: string;
  sizeBytes: number;
  issuedAt?: string;
  expiresAt?: string;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
  /** Relative API path that streams the stored file. */
  downloadUrl: string;
}

export interface Notification {
  id: string;
  familyId: string;
  recipientUserId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  familyId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  safeMetadata?: Record<string, unknown>;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    perPage: number;
    total: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  preferredLocale: Locale;
}

export interface AuthResponse {
  user: User;
  family?: Family;
}

// Dashboard types
export interface DashboardData {
  tasks: {
    today: Task[];
    overdue: Task[];
    upcoming: Task[];
  };
  events: {
    today: CalendarEvent[];
    upcoming: CalendarEvent[];
  };
  babyLogs: {
    recent: BabyLog[];
  };
  budget: {
    monthlyExpenses: number;
    budgetAmount: number;
    remaining: number;
    categoryBreakdown: Record<string, number>;
  };
  notifications: {
    unread: Notification[];
    unreadCount: number;
  };
}
