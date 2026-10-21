/**
 * One definition of the session cookie, used when it is issued *and* when it is
 * cleared — `clearCookie` only removes a cookie whose attributes match.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
