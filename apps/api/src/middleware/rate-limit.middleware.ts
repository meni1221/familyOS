import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const STRICT_AUTH_PATHS = ['/api/v1/auth/register', '/api/v1/auth/login'];

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  private readonly generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '300', 10),
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'התעברת על מגבלת הבקשות. נסו שוב מאוחר יותר.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  private readonly authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS ?? '20', 10),
    message: {
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'יותר מדי ניסיונות התחברות. נסו שוב בעוד 15 דקות.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path;
    const isStrictAuthPath =
      req.method === 'POST' && STRICT_AUTH_PATHS.some((p) => path.startsWith(p));

    if (isStrictAuthPath) {
      return this.authLimiter(req, res, next);
    }

    return this.generalLimiter(req, res, next);
  }
}
