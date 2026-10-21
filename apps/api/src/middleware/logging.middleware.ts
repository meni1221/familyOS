import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RequestWithId } from './request-id.middleware';

/**
 * One line per request, with the id the caller also received in `X-Request-Id`.
 *
 * `durationMs` is a number rather than a `"12ms"` string so a collector can
 * average it; the level follows the status, which is the only signal available
 * at this point — an exception's stack is logged where it is thrown.
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: RequestWithId, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    // A health check every ten seconds would otherwise be most of the log.
    if (originalUrl === '/health') {
      return next();
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const durationMs = Date.now() - start;

      const logEntry = {
        requestId: req.requestId,
        method,
        url: originalUrl,
        statusCode,
        durationMs,
        ip: ip ?? 'unknown',
        userAgent: req.get('User-Agent') ?? 'unknown',
      };

      const line = `Request completed: ${method} ${originalUrl} - ${statusCode} (${durationMs}ms)`;

      if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
        this.logger.error(line, logEntry);
      } else if (statusCode >= StatusCodes.BAD_REQUEST) {
        this.logger.warn(line, logEntry);
      } else {
        this.logger.log(line, logEntry);
      }
    });

    next();
  }
}
