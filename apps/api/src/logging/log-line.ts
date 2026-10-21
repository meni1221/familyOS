/** The levels Nest knows, named the same way so `LOG_LEVEL` can map onto them. */
export type LevelName = 'error' | 'warn' | 'log' | 'debug' | 'verbose' | 'fatal';

/**
 * One log line, as a collector reads it: a single JSON object, nothing around
 * it. Any deployment that ships a container's stdout somewhere (Loki, CloudWatch,
 * `docker logs` piped to a file) can index `level`, `time` and `requestId`
 * without a per-application parser.
 *
 * The fixed fields are written last on purpose: a metadata key must not be able
 * to pass itself off as the level of the line it is attached to.
 */
export const formatLogLine = (
  level: LevelName,
  message: string,
  meta: Record<string, unknown> = {}
): string => JSON.stringify({ ...meta, time: new Date().toISOString(), level, message });
