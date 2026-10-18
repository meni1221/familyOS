import type { BabyLog } from '../../lib/types';

const DIAPER_LABELS: Record<string, string> = {
  WET: 'רטוב',
  DIRTY: 'מלוכלך',
  BOTH: 'שניהם',
};

/** The extras of a log — amount, sleep length, diaper kind — as display parts. */
export function detailSummary(log: BabyLog): string[] {
  const parts: string[] = [];
  const details = (log.details ?? {}) as Record<string, unknown>;

  if (typeof details.amountMl === 'number') parts.push(`${details.amountMl} מ״ל`);
  if (typeof details.durationMinutes === 'number') parts.push(`${details.durationMinutes} דקות`);
  if (typeof details.diaperType === 'string') {
    parts.push(DIAPER_LABELS[details.diaperType] ?? String(details.diaperType));
  }

  return parts;
}
