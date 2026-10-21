import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { isAllowedOrigin } from './origin';

/**
 * CSRF protection for cookie-authenticated, state-changing requests.
 *
 * The defence is the browser's own `Origin`: every cross-site `POST`, `PATCH`
 * or `DELETE` carries one, so a request from another site can be recognised
 * even though the victim's session cookie came along. `Referer` is the fallback
 * for browsers or clients that omit `Origin`.
 *
 * Both are compared against the exact origins the app is served from. A
 * request with neither header — curl, the test suite, a server-to-server call —
 * is allowed: it cannot be produced by a victim's browser on an attacker's
 * behalf, which is the only thing this middleware is defending against.
 *
 * Same-origin requests through the Vite proxy (development) or nginx
 * (production) pass, because the browser reports the page's origin.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  private readonly allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    process.env.API_URL ?? 'http://localhost:3001',
  ].filter(Boolean);

  use(req: Request, _res: Response, next: NextFunction) {
    if (this.safeMethods.includes(req.method)) {
      return next();
    }

    const origin = req.headers.origin;
    if (origin && !isAllowedOrigin(origin, this.allowedOrigins)) {
      throw new ForbiddenException({
        error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'מקור הבקשה אינו מורשה' },
      });
    }

    const referer = req.headers.referer;
    if (!origin && referer && !isAllowedOrigin(referer, this.allowedOrigins)) {
      throw new ForbiddenException({
        error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'מקור הבקשה אינו מורשה' },
      });
    }

    next();
  }
}
