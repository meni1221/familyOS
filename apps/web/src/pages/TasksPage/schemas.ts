import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'נדרש שם למשימה'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().optional(),
  dueAt: z.string().optional(),
  assigneeUserId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
