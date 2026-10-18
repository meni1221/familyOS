import { z } from 'zod';
import type { Currency } from '../../lib/types';

/** Currencies the budget screens offer, in the order they are listed. */
export const CURRENCIES: Currency[] = ['ILS', 'USD', 'EUR', 'GBP'];

export const budgetSchema = z.object({
  name: z.string().min(1, 'נדרש שם לתקציב'),
  amount: z.coerce.number().min(0, 'הסכום לא יכול להיות שלילי'),
  currency: z.enum(['ILS', 'USD', 'EUR', 'GBP']),
  period: z.enum(['MONTHLY', 'YEARLY']),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

export const expenseSchema = z.object({
  category: z.string().min(1, 'נדרשת קטגוריה'),
  amount: z.coerce.number().gt(0, 'הסכום חייב להיות גדול מאפס'),
  currency: z.enum(['ILS', 'USD', 'EUR', 'GBP']),
  description: z.string().optional(),
  occurredAt: z.string().min(1, 'נדרש תאריך'),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
