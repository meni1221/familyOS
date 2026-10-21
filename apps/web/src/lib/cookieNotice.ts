/**
 * Whether the cookie notice has been dismissed, and the memory of dismissing
 * it.
 *
 * Storage is treated as optional: private windows and browsers with site data
 * blocked throw on access. A failure to remember the dismissal must never take
 * the page down — the notice simply appears again next time.
 */
const STORAGE_KEY = 'shlanu:cookie-notice';

/** Bump when the wording changes enough to deserve a second look. */
const NOTICE_VERSION = '1';

/** How long the notice waits after first paint, so it does not race the hero. */
export const COOKIE_NOTICE_DELAY_MS = 1200;

export const hasSeenCookieNotice = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === NOTICE_VERSION;
  } catch {
    return false;
  }
};

export const rememberCookieNotice = (): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, NOTICE_VERSION);
  } catch {
    // Nothing to do: it will show again next visit.
  }
};
