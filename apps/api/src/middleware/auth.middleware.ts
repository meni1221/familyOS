import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { hashToken, sessionStore } from '../modules/auth/session.store';

/**
 * Resolves the session cookie into `req.user`.
 * Kept dependency-free so it can be mounted directly from `app.setup.ts`
 * before the Nest router, matching the other global middlewares.
 *
 * The lookup now reaches the database, so the middleware is asynchronous: it
 * never fails a request, and a storage hiccup simply leaves the caller
 * unauthenticated (the controllers answer 401 from there).
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    this.resolve(req)
      .catch(() => undefined)
      .finally(() => next());
  }

  private async resolve(req: Request): Promise<void> {
    const token = req.cookies?.session;
    if (!token) return;

    const session = await sessionStore.get(hashToken(token));

    if (session && session.expiresAt > Date.now()) {
      (req as any).user = {
        id: session.userId,
        familyId: session.familyId ?? session.userId,
      };
    }
  }
}
