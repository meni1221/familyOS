import { z } from 'zod';
import type { LogLevel } from '@nestjs/common';

/**
 * The environment the API actually reads.
 *
 * Deliberately small: a key belongs here when some code reads it. The examples
 * used to list SMTP settings, cookie flags and feature toggles that nothing
 * touched, which made a deployment look configured when it was not.
 *
 * A missing or malformed value stops the process on boot, with the name of the
 * key in the message — a server that starts and then fails every database query
 * is harder to diagnose than one that refuses to start.
 */
/**
 * An optional key, where an empty value means "not set".
 *
 * Docker Compose interpolates a missing variable to an empty string, and
 * `SMTP_HOST=` must mean "there is no mail server", not "the mail server is a
 * server with no name".
 */
const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional()
);

const optionalNumber = (fallback: number, min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().int().min(min).max(max).default(fallback)
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  DATABASE_URL: z.string().min(1, 'is required'),
  DATABASE_NAME: z.string().min(1).default('Shlanu'),

  // Optional override for Node's resolver, applied in database.module.ts. See
  // dns.ts: a host whose resolver list is broken cannot expand `mongodb+srv`.
  DNS_SERVERS: optionalString,

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:3001'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty']).default('json'),

  // Optional: an installation without a mail server must still boot. When these
  // are absent the app says so at startup, and in production a password reset
  // is refused loudly rather than silently doing nothing.
  SMTP_HOST: optionalString,
  SMTP_PORT: optionalNumber(587, 1, 65535),
  SMTP_SECURE: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.enum(['true', 'false']).default('false')
  ),
  SMTP_USER: optionalString,
  SMTP_PASS: optionalString,
  SMTP_FROM: optionalString.default('שלנו <no-reply@shlanu.app>'),
}).superRefine((value, context) => {
  // A username without a password (or the other way round) is a half-configured
  // server that would fail on the first reset instead of on boot.
  if (Boolean(value.SMTP_USER) !== Boolean(value.SMTP_PASS)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['SMTP_USER'],
      message: 'SMTP_USER and SMTP_PASS have to be set together',
    });
  }
});

/**
 * `ConfigModule.validate` hook. Returns the original environment with the
 * parsed values laid over it, so variables the schema does not know about
 * (`PATH`, `HOME`, a cloud provider's own) survive untouched.
 */
export const validateEnv = (config: Record<string, unknown>): Record<string, unknown> => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment — ${problems}`);
  }

  return { ...config, ...parsed.data };
};

/**
 * Nest's five levels, mapped from the one word a deployment sets. `info` is the
 * default because that is what the app printed before the knob existed.
 */
const LOG_LEVELS: Record<string, LogLevel[]> = {
  error: ['fatal', 'error'],
  warn: ['fatal', 'error', 'warn'],
  info: ['fatal', 'error', 'warn', 'log'],
  debug: ['fatal', 'error', 'warn', 'log', 'debug'],
  verbose: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'],
};

export const loggerLevels = (): LogLevel[] =>
  LOG_LEVELS[process.env.LOG_LEVEL ?? 'info'] ?? LOG_LEVELS.info;
