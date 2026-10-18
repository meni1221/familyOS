import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly tokens = new Map<string, { token: string; expires: number }>();

  // Paths that require CSRF protection (state-changing)
  protectedPaths = ['/api/v1/tasks', '/api/v1/calendar', '/api/v1/baby', '/api/v1/budget', '/api/v1/documents', '/api/v1/auth'];

  use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const path = req.path;

    // Only protect state-changing methods
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }

    // Check if path requires CSRF
    const requiresCsrf = this.protectedPaths.some((p) => path.startsWith(p));
    if (!requiresCsrf) {
      return next();
    }

    // Get CSRF token from header
    const csrfToken = req.headers['x-csrf-token'] as string | undefined;
    const sessionToken = req.cookies?.session;

    if (!sessionToken) {
      return next(); // Auth middleware will handle unauthenticated requests
    }

    // Validate CSRF token
    const stored = this.tokens.get(sessionToken);
    if (!stored || !csrfToken) {
      throw new UnauthorizedException({
        error: {
          code: 'CSRF_TOKEN_MISSING',
          message: 'CSRF token חסר או לא תקין',
        },
      });
    }

    // Check expiration
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionToken);
      throw new UnauthorizedException({
        error: {
          code: 'CSRF_TOKEN_EXPIRED',
          message: 'CSRF token פג תוקף',
        },
      });
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = timingSafeEqual(
      Buffer.from(csrfToken),
      Buffer.from(stored.token)
    );

    if (!isValid) {
      throw new UnauthorizedException({
        error: {
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token לא תקין',
        },
      });
    }

    next();
  }

  generateCsrfToken(sessionToken: string): string {
    const token = randomBytes(32).toString('hex');
    this.tokens.set(sessionToken, {
      token,
      expires: Date.now() + 3600000, // 1 hour
    });
    return token;
  }

  // Cleanup expired tokens periodically
  constructor() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.tokens.entries()) {
        if (now > value.expires) {
          this.tokens.delete(key);
        }
      }
    }, 300000); // Every 5 minutes
  }
}
