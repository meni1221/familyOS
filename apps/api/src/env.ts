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
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),

  DATABASE_URL: z.string().min(1, 'is required'),
  DATABASE_NAME: z.string().min(1).default('Shlanu'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  API_URL: z.string().url().default('http://localhost:3001'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(20),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'verbose']).default('info'),
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
