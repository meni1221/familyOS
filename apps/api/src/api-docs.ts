import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { StatusCodes } from 'http-status-codes';

/**
 * The two query parameters every paginated list takes. Declared once so the
 * documented numbers cannot drift away from `PageQueryDto`.
 */
export const ApiPagination = () =>
  applyDecorators(
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Records to return (1–100, default 50).',
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      type: Number,
      description: 'Records to skip (default 0).',
    })
  );


/**
 * The session cookie is the only credential this API accepts, and every
 * protected controller opens with the same `if (!user) throw
 * new UnauthorizedException(...)`. Documenting that once per controller
 * documents it once per route, without repeating a paragraph everywhere.
 */
export const ApiSessionAuth = () =>
  applyDecorators(
    ApiCookieAuth('session'),
    ApiResponse({
      status: StatusCodes.UNAUTHORIZED,
      description: 'The `session` cookie is missing, or its session has expired.',
    })
  );

/**
 * A row that does not exist in the caller's family. Another family's id looks
 * exactly the same from the outside, which is the point: the API never says
 * whether a record exists somewhere else.
 */
export const ApiNotFound = (what: string) =>
  ApiResponse({
    status: StatusCodes.NOT_FOUND,
    description: `No ${what} with that id in the caller's family.`,
  });
