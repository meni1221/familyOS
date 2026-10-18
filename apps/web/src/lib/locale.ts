import { setFormatLocale } from './format';
import type { Locale } from './types';

/**
 * Locale handling for the UI shell.
 *
 * The app ships Hebrew-first (RTL) with English as a second option. Switching
 * updates the document direction, the language attribute and the locale used by
 * every date/number/currency formatter — UI strings are still Hebrew-only, see
 * `docs/AUDIT.md` for that documented gap.
 */

const STORAGE_KEY = 'shlanu:locale';

export const LOCALE_LABELS: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
};

const FORMAT_LOCALES: Record<Locale, string> = {
  he: 'he-IL',
  en: 'en-GB',
};

export const normalizeLocale = (value: string | null | undefined): Locale => {
  return value === 'en' ? 'en' : 'he';
};

export const getStoredLocale = (): Locale => {
  if (typeof window === 'undefined') return 'he';
  try {
    return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'he';
  }
};

/** Applies a locale to the document and remembers it for the next visit. */
export const applyLocale = (locale: Locale): void => {
  const direction = locale === 'he' ? 'rtl' : 'ltr';
  const root = document.documentElement;

  root.setAttribute('lang', locale);
  root.setAttribute('dir', direction);
  setFormatLocale(FORMAT_LOCALES[locale]);

  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Private browsing: the preference just won't survive a reload.
  }
};
