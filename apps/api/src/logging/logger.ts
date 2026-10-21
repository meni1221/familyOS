import { LoggerService, LogLevel } from '@nestjs/common';
import { loggerLevels } from '../env';
import { JsonLogger } from './json-logger';

/**
 * The logger the app is built with.
 *
 * JSON by default: a container's stdout is read by a collector, not a person.
 * `LOG_FORMAT=pretty` returns Nest's own logger, whose coloured, aligned lines
 * are nicer while developing.
 */
export const createLogger = (): LoggerService | LogLevel[] => {
  const levels = loggerLevels();
  return (process.env.LOG_FORMAT ?? 'json') === 'pretty' ? levels : new JsonLogger(levels);
};
