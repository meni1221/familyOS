import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  // General API rate limiter
  private readonly generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'התעברת על מגבלת הבקשות. נסו שוב מאוחר יותר.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Auth rate limiter (stricter)
  private readonly authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? '5', 10),
    message: {
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'יותר מדי ניסיונות התחברות. נסו שוב בעוד 15 דקות.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Invitation rate limiter
  private readonly invitationLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.INVITATION_RATE_LIMIT_MAX_REQUESTS ?? '10', 10),
    message: {
      error: {
        code: 'INVITATION_RATE_LIMIT_EXCEEDED',
        message: 'התעברת על מגבלת ההזמנות. נסו שוב מאוחר יותר.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;

    // Apply stricter limits for auth endpoints
    if (path.includes('/auth/')) {
      return this.authLimiter(req, res, next);
    }

    // Apply invitation limits
    if (path.includes('/invitations')) {
      return this.invitationLimiter(req, res, next);
    }

    // General API limits
    return this.generalLimiter(req, res, next);
  }
}
