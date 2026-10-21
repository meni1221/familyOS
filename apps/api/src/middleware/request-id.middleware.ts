import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export interface RequestWithId extends Request {
  requestId?: string;
}

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * An id a caller may bring (a gateway or a browser setting one) or gets from us.
 *
 * Only a conservative alphabet and length are accepted: the value is written
 * back into a response header and into every log line for the request, so
 * newlines or a megabyte of text would travel further than they should.
 */
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

export const resolveRequestId = (incoming: string | undefined): string =>
  incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();

/**
 * Tags every request with an id and returns it in `X-Request-Id`.
 *
 * When someone reports "it broke at 14:32", the id they can read off the network
 * tab is the fastest way to the exact lines in the log.
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction) {
    const id = resolveRequestId(req.get(REQUEST_ID_HEADER));
    req.requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}
