import { LogLevel } from '@nestjs/common';
import { formatLogLine } from './log-line';
import { JsonLogger, LogSink } from './json-logger';

describe('formatLogLine', () => {
  it('writes a single JSON object with the fixed fields', () => {
    const parsed = JSON.parse(formatLogLine('warn', 'Request completed', { statusCode: 404 }));

    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('Request completed');
    expect(parsed.statusCode).toBe(404);
    expect(Number.isNaN(Date.parse(parsed.time))).toBe(false);
  });

  it('does not let metadata rename the level or the message', () => {
    const parsed = JSON.parse(
      formatLogLine('error', 'the real message', { level: 'log', message: 'a decoy' })
    );

    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('the real message');
  });

  it('stays on one line when the message contains newlines', () => {
    const line = formatLogLine('error', 'first line\nsecond line');

    expect(line).not.toContain('\n');
    expect(JSON.parse(line).message).toBe('first line\nsecond line');
  });
});

describe('JsonLogger', () => {
  const makeLogger = (levels: LogLevel[]) => {
    const lines: Array<{ kind: 'out' | 'err'; line: string }> = [];
    const sink: LogSink = (kind, line) => lines.push({ kind, line });
    return { logger: new JsonLogger(levels, sink), lines };
  };

  it('drops levels the deployment did not ask for', () => {
    const { logger, lines } = makeLogger(['error', 'warn']);

    logger.log('routine noise');
    logger.debug('more noise');

    expect(lines).toHaveLength(0);
  });

  it('keeps the metadata, the context and the message of what it does print', () => {
    const { logger, lines } = makeLogger(['error', 'warn', 'log']);

    logger.warn('Request completed', { requestId: 'abc-123', statusCode: 429 }, 'HTTP');

    expect(JSON.parse(lines[0].line)).toMatchObject({
      level: 'warn',
      message: 'Request completed',
      context: 'HTTP',
      requestId: 'abc-123',
      statusCode: 429,
    });
  });

  it('sends errors to the error stream and the rest to stdout', () => {
    const { logger, lines } = makeLogger(['error', 'log']);

    logger.error('boom');
    logger.log('fine');

    expect(lines.map((entry) => entry.kind)).toEqual(['err', 'out']);
  });

  it('serialises an Error message instead of printing an empty object', () => {
    const { logger, lines } = makeLogger(['error']);

    logger.error(new Error('database is gone'));

    expect(JSON.parse(lines[0].line).message).toContain('database is gone');
  });
});
