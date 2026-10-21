/**
 * The normalized origin of a URL or of an `Origin` header, or `null` when the
 * value is not a URL at all (`Origin: null` from a sandboxed frame, a proxy
 * typo, a header a browser never sends).
 */
export const originOf = (value: string | undefined): string | null => {
  if (!value) return null;

  try {
    const origin = new URL(value).origin;
    return origin === 'null' ? null : origin;
  } catch {
    return null;
  }
};

/**
 * Whether `value` names exactly one of `allowedOrigins`.
 *
 * Exact match rather than a prefix: `https://app.shlanu.app.evil.com` starts
 * with the allowed origin, and a prefix check would hand a domain the attacker
 * controls every state-changing request a victim's browser makes.
 *
 * A `Referer` is a full URL, so it is reduced to its origin first — which is
 * also why a page served from the frontend passes while a page that merely
 * links to it does not.
 */
export const isAllowedOrigin = (
  value: string | undefined,
  allowedOrigins: readonly string[]
): boolean => {
  const origin = originOf(value);
  if (!origin) return false;

  return allowedOrigins.some((allowed) => originOf(allowed) === origin);
};
