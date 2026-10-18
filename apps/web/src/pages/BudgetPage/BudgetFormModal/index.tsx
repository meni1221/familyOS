import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { CURRENCY_LABELS } from '../../../lib/format';
import type { Currency } from '../../../lib/types';
import { CURRENCIES, budgetSchema, type BudgetFormData } from '../schemas';

interface BudgetFormModalProps {
  open: boolean;
  /** The family currency a new budget starts on. */
  defaultCurrency: Currency;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: BudgetFormData) => void;
}

/** Dialog for adding one budget. */
export default function BudgetFormModal({
  open,
  defaultCurrency,
  isPending,
  error,
  onClose,
  onSubmit,
}: BudgetFormModalProps) {
  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', amount: 0, period: 'MONTHLY', currency: defaultCurrency },
  });

  // Every opening starts from a blank budget on the family currency.
  useEffect(() => {
    if (open) {
      form.reset({ name: '', amount: 0, period: 'MONTHLY', currency: defaultCurrency });
    }
  }, [open, defaultCurrency, form]);

  return (
    <Modal
      open={open}
      title="תקציב חדש"
      onClose={onClose}
      footer={
        <>
          <button type="submit" form="budget-form" className="btn-primary btn-sm" disabled={isPending}>
            {isPending ? 'יוצר…' : 'יצירת תקציב'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form
        id="budget-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div>
          <label htmlFor="budget-name" className="label">
            שם התקציב
          </label>
          <input
            id="budget-name"
            className={`input ${form.formState.errors.name ? 'input-error' : ''}`}
            placeholder="מזון, בילויים, חינוך…"
            {...form.register('name')}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-error">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="budget-amount" className="label">
              סכום
            </label>
            <input
              id="budget-amount"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              className={`input text-numeric ${form.formState.errors.amount ? 'input-error' : ''}`}
              {...form.register('amount')}
            />
            {form.formState.errors.amount && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.amount.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="budget-currency" className="label">
              מטבע
            </label>
            <select id="budget-currency" className="input" {...form.register('currency')}>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {CURRENCY_LABELS[currency]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="budget-period" className="label">
            תקופה
          </label>
          <select id="budget-period" className="input" {...form.register('period')}>
            <option value="MONTHLY">חודשי</option>
            <option value="YEARLY">שנתי</option>
          </select>
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'יצירת התקציב נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
}
