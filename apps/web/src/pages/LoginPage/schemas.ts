import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(1, 'נדרש סיסמה'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
