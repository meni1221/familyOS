import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { sessionStore } from '../modules/auth/session.store';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.session;
    if (token) {
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const session = sessionStore.get(tokenHash);

      if (session && session.expiresAt > Date.now()) {
        (req as any).user = {
          id: session.userId,
          email: '',
          displayName: '',
          preferredLocale: 'he',
          familyId: session.userId,
        };
      }
    }
    next();
  }
}
