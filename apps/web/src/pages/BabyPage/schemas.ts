import { z } from 'zod';

export const logSchema = z.object({
  type: z.enum(['FEEDING', 'SLEEP', 'DIAPER', 'NOTE']),
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
});

export type ProfileFormData = z.infer<typeof profileSchema>;
