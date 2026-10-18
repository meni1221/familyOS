import { z } from 'zod';

/** The API refuses anything larger, so the form checks it first. */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const documentSchema = z.object({
  title: z.string().min(1, 'נדרש שם למסמך'),
  category: z.string().min(1, 'נדרשת קטגוריה'),
  description: z.string().optional(),
  issuedAt: z.string().optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;
