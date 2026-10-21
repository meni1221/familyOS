import { daysSince } from '../../lib/format';
import type { BabyProfile } from '../../lib/types';

/** "בן/בת 180 ימים", or `null` when the birth date was never filled in. */
export const profileAge = (profile: BabyProfile | null | undefined): string | null => {
  if (!profile?.dateOfBirth) return null;

  const days = daysSince(profile.dateOfBirth);
  return days === null ? null : `בן/בת ${days} ימים`;
};
