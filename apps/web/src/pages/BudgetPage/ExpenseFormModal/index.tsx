import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../components/ui/Modal';
import { CURRENCY_LABELS, toDateInputValue } from '../../../lib/format';
import type { Currency } from '../../../lib/types';
import { CURRENCIES, expenseSchema, type ExpenseFormData } from '../schemas';

interface ExpenseFormModalProps {
  open: boolean;
  /** The family currency a new expense starts on. */
  defaultCurrency: Currency;
  isPending: boolean;
  /** Mutation error, shown inline when it happened. */
  error: unknown;
  onClose: () => void;
  onSubmit: (values: ExpenseFormData) => void;
}

/** Dialog for recording one expense. */
const ExpenseFormModal = ({
  open,
  defaultCurrency,
  isPending,
  error,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) => {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: 0,
      currency: defaultCurrency,
      occurredAt: toDateInputValue(),
      description: '',
    },
  });

  // Every opening starts blank and dated today.
  useEffect(() => {
    if (open) {
      form.reset({
        category: '',
        amount: 0,
        currency: defaultCurrency,
        occurredAt: toDateInputValue(),
        description: '',
      });
    }
  }, [open, defaultCurrency, form]);

  return (
    <Modal
      open={open}
      title="הוצאה חדשה"
      onClose={onClose}
      footer={
        <>
          <button
            type="submit"
            form="expense-form"
            className="btn-primary btn-sm"
            disabled={isPending}
          >
            {isPending ? 'שומר…' : 'שמירת הוצאה'}
          </button>
          <button type="button" className="btn-secondary btn-sm" onClick={onClose}>
            ביטול
          </button>
        </>
      }
    >
      <form
        id="expense-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expense-category" className="label">
              קטגוריה
            </label>
            <input
              id="expense-category"
              className={`input ${form.formState.errors.category ? 'input-error' : ''}`}
              {...form.register('category')}
            />
            {form.formState.errors.category && (
              <p className="mt-1 text-xs text-error">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="expense-amount" className="label">
              סכום
            </label>
            <input
              id="expense-amount"
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expense-currency" className="label">
              מטבע
            </label>
            <select id="expense-currency" className="input" {...form.register('currency')}>
              {CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {CURRENCY_LABELS[currency]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="expense-date" className="label">
              תאריך
            </label>
            <input
              id="expense-date"
              type="date"
              className="input"
              {...form.register('occurredAt')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="expense-description" className="label">
            תיאור
          </label>
          <input
            id="expense-description"
            className="input"
            {...form.register('description')}
          />
        </div>

        {Boolean(error) && (
          <p className="text-xs text-error" role="alert">
            {error instanceof Error ? error.message : 'שמירת ההוצאה נכשלה'}
          </p>
        )}
      </form>
    </Modal>
  );
};

export default ExpenseFormModal;
