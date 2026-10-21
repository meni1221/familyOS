import { z } from 'zod';
import { BABY_COLORS } from '../../lib/babyColors';

export const logSchema = z.object({
  type: z.enum(['FEEDING', 'SLEEP', 'DIAPER', 'NOTE']),
  /** Empty only while the family has no baby yet: the API creates one then. */
  babyProfileId: z.string().optional(),
  occurredAt: z.string().min(1, 'נדרש מועד'),
  amountMl: z.string().optional(),
  durationMinutes: z.string().optional(),
  diaperType: z.enum(['', 'WET', 'DIRTY', 'BOTH']).optional(),
  note: z.string().optional(),
});

export type LogFormData = z.infer<typeof logSchema>;

export const profileSchema = z.object({
  displayName: z.string().min(1, 'נדרש שם'),
  dateOfBirth: z.string().optional(),
  color: z.enum(BABY_COLORS),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
