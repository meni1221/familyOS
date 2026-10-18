import type { Request } from 'express';

/**
 * What the session cookie resolves to. `AuthMiddleware` attaches it to the
 * request before any controller runs; `familyId` falls back to `id` for a user
 * who is not in a family yet.
 */
export interface AuthenticatedUser {
  id: string;
  familyId: string;
}

/**
 * The request shape the controllers actually see: an Express request that may
 * carry the session's user. Controllers still check for `undefined`, because a
 * request without a session cookie reaches them too.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
