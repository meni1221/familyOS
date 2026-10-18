/**
 * Locale-aware formatting helpers.
 *
 * The active locale is set by `lib/locale.ts` (`applyLocale`) and defaults to
 * Hebrew, so formatting follows the language the user picked in settings.
 */

let activeLocale = 'he-IL';

/** Called by `lib/locale.ts` whenever the UI language changes. */
export const setFormatLocale = (locale: string): void => {
  activeLocale = locale;
};

export const getFormatLocale = (): string => {
  return activeLocale;
};

export const SUPPORTED_CURRENCIES = ['ILS', 'USD', 'EUR', 'GBP'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  ILS: 'שקל (₪)',
  USD: 'דולר ($)',
  EUR: 'אירו (€)',
  GBP: 'לירה שטרלינג (£)',
};

export const formatCurrency = (
  amount: number | undefined | null,
  currency: string = 'ILS'
): string => {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '—';
  }

  try {
    return new Intl.NumberFormat(activeLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(activeLocale).format(value);
};

const toDate = (value: string | Date | undefined | null): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value: string | Date | undefined | null): string => {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString(activeLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (value: string | Date | undefined | null): string => {
  const date = toDate(value);
  if (!date) return '—';
  return `${formatDate(date)} · ${date.toLocaleTimeString(activeLocale, {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

export const formatTime = (value: string | Date | undefined | null): string => {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString(activeLocale, { hour: '2-digit', minute: '2-digit' });
};

export const formatMonth = (value: string | Date): string => {
  const date = toDate(value) ?? new Date();
  return date.toLocaleDateString(activeLocale, { month: 'long', year: 'numeric' });
};

/** Human-readable file size, e.g. `1.4 MB`. */
export const formatBytes = (bytes: number | undefined | null): string => {
  if (bytes === undefined || bytes === null || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

/** Whole days elapsed since `value` (negative when in the future). */
export const daysSince = (value: string | Date | undefined | null): number | null => {
  const date = toDate(value);
  if (!date) return null;
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - start.getTime()) / dayMs);
};

/** Value for an `<input type="date">` / `<input type="datetime-local">`. */
export const toDateInputValue = (value: Date = new Date()): string => {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 10);
};

export const toDateTimeInputValue = (value: Date = new Date()): string => {
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
};
