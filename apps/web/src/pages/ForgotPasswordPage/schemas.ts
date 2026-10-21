import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'נדרש אימייל').email('כתובת אימייל לא תקינה'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
