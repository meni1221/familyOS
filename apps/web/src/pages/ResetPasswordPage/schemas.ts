import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים'),
    confirmPassword: z.string().min(1, 'נדרש לאמת את הסיסמה'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'הסיסמאות אינן זהות',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
