import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1, 'נדרש שם לאירוע'),
  date: z.string().min(1, 'נדרש תאריך'),
  startTime: z.string().min(1, 'נדרשת שעת התחלה'),
  endTime: z.string().min(1, 'נדרשת שעת סיום'),
  location: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
