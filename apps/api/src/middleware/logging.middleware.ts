import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    // Skip logging for health checks
    if (originalUrl === '/health') {
      return next();
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;

      // Don't log sensitive data (passwords, tokens, etc.)
      const logEntry = {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        ip: ip ?? 'unknown',
        userAgent: req.get('User-Agent') ?? 'unknown',
        timestamp: new Date().toISOString(),
      };

      // Log level based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `Request completed: ${method} ${originalUrl} - ${statusCode} (${duration}ms)`,
          logEntry
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `Request completed: ${method} ${originalUrl} - ${statusCode} (${duration}ms)`,
          logEntry
        );
      } else {
        this.logger.log(
          `Request completed: ${method} ${originalUrl} - ${statusCode} (${duration}ms)`,
          logEntry
        );
      }
    });

    next();
  }
}
