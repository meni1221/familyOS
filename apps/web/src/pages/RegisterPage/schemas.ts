import { z } from 'zod';

export const registerSchema = z
  .object({
    displayName: z.string().min(2, 'שם צריך להכיל לפחות 2 תווים'),
    email: z.string().email('כתובת אימייל לא תקינה'),
    password: z.string().min(8, 'סיסמה צריכה להכיל לפחות 8 תווים'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'הסיסמאות לא תואמות',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
