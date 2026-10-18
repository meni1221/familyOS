import { afterEach, describe, expect, it } from 'vitest';
import {
  daysSince,
  formatBytes,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  getFormatLocale,
  setFormatLocale,
  toDateInputValue,
  toDateTimeInputValue,
} from './format';

/*
 * These helpers carry the locale/currency requirement of the product: the
 * active locale follows the language picked in settings, and ILS is the
 * default currency. They are pure functions, so they can be asserted directly.
 */

afterEach(() => {
  setFormatLocale('he-IL');
});

describe('formatCurrency', () => {
  it('defaults to ILS and renders the shekel symbol for the active locale', () => {
    const formatted = formatCurrency(1200);

    expect(formatted).toContain('₪');
    expect(formatted).not.toContain('ILS');
    expect(formatted.replace(/[^\d]/g, '')).toContain('1200');
  });

  it('honours an explicit currency', () => {
    setFormatLocale('en-US');

    expect(formatCurrency(12.5, 'USD')).toBe('$12.50');
    expect(formatCurrency(1200, 'ILS')).toContain('₪');
  });

  it('degrades gracefully instead of throwing', () => {
    expect(formatCurrency(undefined)).toBe('—');
    expect(formatCurrency(null)).toBe('—');
    expect(formatCurrency(Number.NaN)).toBe('—');
    expect(formatCurrency(10, 'NOT-A-CURRENCY')).toBe('10 NOT-A-CURRENCY');
  });
});

describe('formatNumber', () => {
  it('follows the active locale', () => {
    setFormatLocale('en-US');
    expect(formatNumber(1234.5)).toBe('1,234.5');

    setFormatLocale('he-IL');
    expect(formatNumber(1234.5).replace(/[^\d.,]/g, '')).toContain('1,234.5');
  });

  it('returns a dash for missing values', () => {
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(Number.NaN)).toBe('—');
  });
});

describe('date formatting', () => {
  it('switches language with the active locale', () => {
    const value = '2026-01-15T12:00:00Z';

    setFormatLocale('en-US');
    expect(getFormatLocale()).toBe('en-US');
    expect(formatDate(value)).toContain('2026');
    expect(formatDate(value)).toMatch(/Jan/i);

    setFormatLocale('he-IL');
    expect(formatDate(value)).toMatch(/[\u0590-\u05FF]/);
    expect(formatDate(value)).not.toMatch(/Jan/i);
  });

  it('composes date and time, and rejects junk', () => {
    setFormatLocale('en-US');

    expect(formatDateTime('2026-01-15T12:00:00Z')).toContain('·');
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
  });

  it('produces values for date inputs in local time', () => {
    expect(toDateInputValue(new Date(2026, 2, 5, 10, 30))).toBe('2026-03-05');
    expect(toDateTimeInputValue(new Date(2026, 2, 5, 10, 30))).toBe('2026-03-05T10:30');
  });
});

describe('daysSince', () => {
  it('counts whole calendar days', () => {
    expect(daysSince(new Date())).toBe(0);
    expect(daysSince(new Date(Date.now() - 24 * 60 * 60 * 1000))).toBe(1);
    expect(daysSince(new Date(Date.now() + 24 * 60 * 60 * 1000))).toBe(-1);
    expect(daysSince(null)).toBeNull();
  });
});

describe('formatBytes', () => {
  it('scales units and keeps one significant decimal', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    expect(formatBytes(12 * 1024 * 1024)).toBe('12 MB');
    expect(formatBytes(undefined)).toBe('—');
  });
});
