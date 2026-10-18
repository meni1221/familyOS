import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { hashToken, sessionStore } from '../modules/auth/session.store';

/**
 * Resolves the session cookie into `req.user`.
 * Kept dependency-free so it can be mounted directly from `main.ts`
 * before the Nest router, matching the other global middlewares.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.session;

    if (token) {
      const session = sessionStore.get(hashToken(token));

      if (session && session.expiresAt > Date.now()) {
        (req as any).user = {
          id: session.userId,
          familyId: session.familyId ?? session.userId,
        };
      }
    }

    next();
  }
}
