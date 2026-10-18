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
export type NotificationType = 'TASK_ASSIGNED' | 'EVENT_REMINDER' | 'INVITATION' | 'DOCUMENT_EXPIRING' | 'SYSTEM';

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
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  issuedAt?: string;
  expiresAt?: string;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
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
