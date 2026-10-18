import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * CSRF protection for cookie-authenticated, state-changing requests.
 *
 * Strategy (double protection, browser-friendly):
 *  1. Origin / Referer must match the allowed frontend origin when present.
 *     Browsers always send `Origin` on cross-site POSTs, so a mismatch is a
 *     reliable CSRF signal.
 *  2. If the client sends `x-csrf-token`, it must match the token issued for
 *     the current session (`generateCsrfToken`).
 *
 * Same-origin requests coming through the Vite proxy (dev) or nginx (prod)
 * pass check 1, and non-browser clients (curl, tests) without `Origin` are
 * allowed — they cannot be abused by a victim's browser.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly tokens = new Map<string, { token: string; expires: number }>();

  private readonly safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  private readonly allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:5173',
    process.env.API_URL ?? 'http://localhost:3001',
  ].filter(Boolean);

  use(req: Request, res: Response, next: NextFunction) {
    if (this.safeMethods.includes(req.method)) {
      return next();
    }

    const origin = req.headers.origin as string | undefined;
    const referer = req.headers.referer as string | undefined;

    if (origin && !this.isAllowedOrigin(origin)) {
      throw new ForbiddenException({
        error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'מקור הבקשה אינו מורשה' },
      });
    }

    if (!origin && referer && !this.isAllowedOrigin(referer)) {
      throw new ForbiddenException({
        error: { code: 'CSRF_ORIGIN_MISMATCH', message: 'מקור הבקשה אינו מורשה' },
      });
    }

    const sessionToken = req.cookies?.session;
    const csrfToken = req.headers['x-csrf-token'] as string | undefined;

    if (sessionToken && csrfToken) {
      const stored = this.tokens.get(sessionToken);
      if (!stored || stored.token !== csrfToken || Date.now() > stored.expires) {
        throw new ForbiddenException({
          error: { code: 'CSRF_TOKEN_INVALID', message: 'CSRF token חסר או לא תקין' },
        });
      }
    }

    next();
  }

  generateCsrfToken(sessionToken: string): string {
    const token = randomBytes(32).toString('hex');
    this.tokens.set(sessionToken, { token, expires: Date.now() + 3_600_000 });
    return token;
  }

  private isAllowedOrigin(value: string): boolean {
    return this.allowedOrigins.some((allowed) => value.startsWith(allowed));
  }

  constructor() {
    const timer = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.tokens.entries()) {
        if (now > value.expires) {
          this.tokens.delete(key);
        }
      }
    }, 300_000);
    timer.unref?.();
  }
}
