import { LoggerService, LogLevel } from '@nestjs/common';
import { formatLogLine, LevelName } from './log-line';

/** A single log line should not be able to bury the rest of the log. */
const MAX_MESSAGE_LENGTH = 4000;

/** Where a finished line goes — a seam the tests use instead of spying on stdout. */
export type LogSink = (kind: 'out' | 'err', line: string) => void;

const writeToConsole: LogSink = (kind, line) => {
  (kind === 'err' ? process.stderr : process.stdout).write(`${line}\n`);
};

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack ?? value.message;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

/**
 * Nest's logger, emitting one JSON object per line.
 *
 * Nest's own logger prints a coloured human line and then dumps any metadata as
 * `Object:` — readable in a terminal, useless to a log collector. `LOG_FORMAT`
 * decides which one a deployment gets.
 */
export class JsonLogger implements LoggerService {
  constructor(
    private readonly levels: LogLevel[],
    private readonly sink: LogSink = writeToConsole
  ) {}

  log(message: unknown, ...params: unknown[]): void {
    this.write('log', message, params);
  }

  error(message: unknown, ...params: unknown[]): void {
    this.write('error', message, params);
  }

  warn(message: unknown, ...params: unknown[]): void {
    this.write('warn', message, params);
  }

  debug(message: unknown, ...params: unknown[]): void {
    this.write('debug', message, params);
  }

  verbose(message: unknown, ...params: unknown[]): void {
    this.write('verbose', message, params);
  }

  fatal(message: unknown, ...params: unknown[]): void {
    this.write('fatal', message, params);
  }

  /**
   * Nest's convention is `log(message, ...objects, context?)`: the objects are
   * metadata and the trailing string, when there is one, is the context.
   */
  private write(level: LevelName, message: unknown, params: unknown[]): void {
    if (!this.levels.includes(level)) return;

    const meta: Record<string, unknown> = {};
    let context: string | undefined;

    for (const param of params) {
      if (typeof param === 'string') {
        context = param;
      } else if (param !== null && typeof param === 'object') {
        Object.assign(meta, param);
      }
    }

    if (context) meta.context = context;

    const line = formatLogLine(level, toText(message).slice(0, MAX_MESSAGE_LENGTH), meta);
    this.sink(level === 'error' || level === 'fatal' ? 'err' : 'out', line);
  }
}
