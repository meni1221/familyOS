import { z } from 'zod';

export const inviteSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  role: z.enum(['OWNER', 'MEMBER']),
});

export type InviteFormData = z.infer<typeof inviteSchema>;
