import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconCoin, IconPlus, IconWallet } from '@tabler/icons-react';
import { api } from '../lib/api';
import { useCurrentFamily } from '../hooks/useFamily';
import { CURRENCY_LABELS, formatCurrency, formatDate, toDateInputValue } from '../lib/format';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import DeleteButton from '../components/ui/DeleteButton';
import EmptyState from '../components/ui/EmptyState';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { Budget, Currency, Expense } from '../lib/types';

const CURRENCIES: Currency[] = ['ILS', 'USD', 'EUR', 'GBP'];

const budgetSchema = z.object({
  name: z.string().min(1, 'נדרש שם לתקציב'),
  amount: z.coerce.number().min(0, 'הסכום לא יכול להיות שלילי'),
  currency: z.enum(['ILS', 'USD', 'EUR', 'GBP']),
  period: z.enum(['MONTHLY', 'YEARLY']),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

const expenseSchema = z.object({
  category: z.string().min(1, 'נדרשת קטגוריה'),
  amount: z.coerce.number().gt(0, 'הסכום חייב להיות גדול מאפס'),
  currency: z.enum(['ILS', 'USD', 'EUR', 'GBP']),
  description: z.string().optional(),
  occurredAt: z.string().min(1, 'נדרש תאריך'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function BudgetPage() {
  const client = useQueryClient();
  const { data: family } = useCurrentFamily();
  const defaultCurrency = family?.defaultCurrency ?? 'ILS';

  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: async () => (await api.get<{ data: Budget[] }>('/api/v1/budget')).data ?? [],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ['budget', 'expenses'],
    queryFn: async () =>
      (await api.get<{ data: Expense[] }>('/api/v1/budget/expenses')).data ?? [],
  });

  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['budget'] });
    void client.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createBudget = useMutation({
    mutationFn: (values: BudgetFormData) => api.post('/api/v1/budget', values),
    onSuccess: () => {
      invalidate();
      setBudgetFormOpen(false);
    },
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/budget/${id}`),
    onSuccess: invalidate,
  });

  const createExpense = useMutation({
    mutationFn: (values: ExpenseFormData) =>
      api.post('/api/v1/budget/expenses', {
        ...values,
        description: values.description?.trim() || undefined,
        occurredAt: new Date(values.occurredAt).toISOString(),
      }),
    onSuccess: () => {
      invalidate();
      setExpenseFormOpen(false);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/budget/expenses/${id}`),
    onSuccess: invalidate,
  });

  const budgetForm = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { name: '', amount: 0, period: 'MONTHLY', currency: defaultCurrency as Currency },
  });

  const expenseForm = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      amount: 0,
      currency: defaultCurrency as Currency,
      occurredAt: toDateInputValue(),
      description: '',
    },
  });

  const openBudgetForm = () => {
    budgetForm.reset({ name: '', amount: 0, period: 'MONTHLY', currency: defaultCurrency as Currency });
    setBudgetFormOpen(true);
  };

  const openExpenseForm = () => {
    expenseForm.reset({
      category: '',
      amount: 0,
      currency: defaultCurrency as Currency,
      occurredAt: toDateInputValue(),
      description: '',
    });
    setExpenseFormOpen(true);
  };

  const summary = useMemo(() => {
    const now = new Date();
    const monthlyExpenses = (expenses ?? [])
      .filter((expense) => {
        const date = new Date(expense.occurredAt);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      })
      .reduce((total, expense) => total + expense.amount, 0);

    const budgetTotal = (budgets ?? [])
      .filter((budget) => budget.period === 'MONTHLY')
      .reduce((total, budget) => total + budget.amount, 0);

    return {
      monthlyExpenses,
      budgetTotal,
      remaining: budgetTotal - monthlyExpenses,
    };
  }, [expenses, budgets]);

  if (budgetsLoading || expensesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">תקציב משפחתי</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary btn-sm" onClick={openBudgetForm}>
            <IconWallet className="h-4 w-4" />
            תקציב חדש
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={openExpenseForm}>
            <IconPlus className="h-4 w-4" />
            הוצאה חדשה
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-label mb-1">הוצאות החודש</p>
          <p className="text-2xl font-bold text-error text-numeric">
            {formatCurrency(summary.monthlyExpenses, defaultCurrency)}
          </p>
        </div>
        <div className="card">
          <p className="text-label mb-1">תקציב חודשי</p>
          <p className="text-2xl font-bold text-ink text-numeric">
            {formatCurrency(summary.budgetTotal, defaultCurrency)}
          </p>
        </div>
        <div className="card">
          <p className="text-label mb-1">נותר</p>
          <p
            className={`text-2xl font-bold text-numeric ${
              summary.remaining < 0 ? 'text-error' : 'text-success'
            }`}
          >
            {formatCurrency(summary.remaining, defaultCurrency)}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="section-title mb-3">תקציבים</h2>
        {(budgets ?? []).length === 0 ? (
          <div className="card">
            <EmptyState
              icon={IconWallet}
              title="אין תקציבים"
              description="הגדירו תקציב חודשי כדי לעקוב אחרי ההוצאות"
              action={
                <button type="button" className="btn-primary btn-sm" onClick={openBudgetForm}>
                  <IconWallet className="h-4 w-4" />
                  תקציב חדש
                </button>
              }
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {(budgets ?? []).map((budget) => (
              <li key={budget.id} className="card flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{budget.name}</p>
                  <p className="text-xs text-ink-secondary">
                    {budget.period === 'MONTHLY' ? 'חודשי' : 'שנתי'}
                  </p>
                </div>
                <span className="text-numeric text-sm font-semibold text-ink">
                  {formatCurrency(budget.amount, budget.currency)}
                </span>
                <DeleteButton
                  itemLabel={`התקציב "${budget.name}"`}
                  disabled={deleteBudget.isPending}
                  onConfirm={() => deleteBudget.mutate(budget.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="section-title mb-3">הוצאות</h2>

        {(deleteExpense.isError || deleteBudget.isError) && (
          <p className="mb-3 text-sm text-error" role="alert">
            המחיקה נכשלה. נסו שוב.
          </p>
        )}

        {(expenses ?? []).length === 0 ? (
          <div className="card">
            <EmptyState
              icon={IconCoin}
              title="אין הוצאות"
              description="התחילו להזין הוצאות כדי לראות את התמונה הכוללת"
              action={
                <button type="button" className="btn-primary btn-sm" onClick={openExpenseForm}>
                  <IconPlus className="h-4 w-4" />
                  הוצאה חדשה
                </button>
              }
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {(expenses ?? []).map((expense) => (
              <li key={expense.id} className="card flex flex-wrap items-center gap-3 py-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-ink-secondary"
                  aria-hidden="true"
                >
                  <IconCoin className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{expense.category}</p>
                  <p className="break-words text-xs text-ink-secondary">
                    {formatDate(expense.occurredAt)}
                    {expense.description && <> · {expense.description}</>}
                  </p>
                </div>

                <Badge variant="neutral">
                  <span className="text-numeric">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </Badge>

                <DeleteButton
                  itemLabel={`ההוצאה על ${expense.category}`}
                  disabled={deleteExpense.isPending}
                  onConfirm={() => deleteExpense.mutate(expense.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── New budget ─────────────────────────────────────────────────────── */}
      <Modal
        open={budgetFormOpen}
        title="תקציב חדש"
        onClose={() => setBudgetFormOpen(false)}
        footer={
          <>
            <button
              type="submit"
              form="budget-form"
              className="btn-primary btn-sm"
              disabled={createBudget.isPending}
            >
              {createBudget.isPending ? 'יוצר…' : 'יצירת תקציב'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setBudgetFormOpen(false)}
            >
              ביטול
            </button>
          </>
        }
      >
        <form
          id="budget-form"
          onSubmit={budgetForm.handleSubmit((values) => createBudget.mutateAsync(values))}
          className="space-y-4"
        >
          <div>
            <label htmlFor="budget-name" className="label">
              שם התקציב
            </label>
            <input
              id="budget-name"
              className={`input ${budgetForm.formState.errors.name ? 'input-error' : ''}`}
              placeholder="מזון, בילויים, חינוך…"
              {...budgetForm.register('name')}
            />
            {budgetForm.formState.errors.name && (
              <p className="mt-1 text-xs text-error">{budgetForm.formState.errors.name.message}</p>
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
                className={`input text-numeric ${
                  budgetForm.formState.errors.amount ? 'input-error' : ''
                }`}
                {...budgetForm.register('amount')}
              />
              {budgetForm.formState.errors.amount && (
                <p className="mt-1 text-xs text-error">
                  {budgetForm.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="budget-currency" className="label">
                מטבע
              </label>
              <select id="budget-currency" className="input" {...budgetForm.register('currency')}>
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
            <select id="budget-period" className="input" {...budgetForm.register('period')}>
              <option value="MONTHLY">חודשי</option>
              <option value="YEARLY">שנתי</option>
            </select>
          </div>

          {createBudget.isError && (
            <p className="text-xs text-error" role="alert">
              {createBudget.error instanceof Error ? createBudget.error.message : 'יצירת התקציב נכשלה'}
            </p>
          )}
        </form>
      </Modal>

      {/* ── New expense ────────────────────────────────────────────────────── */}
      <Modal
        open={expenseFormOpen}
        title="הוצאה חדשה"
        onClose={() => setExpenseFormOpen(false)}
        footer={
          <>
            <button
              type="submit"
              form="expense-form"
              className="btn-primary btn-sm"
              disabled={createExpense.isPending}
            >
              {createExpense.isPending ? 'שומר…' : 'שמירת הוצאה'}
            </button>
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => setExpenseFormOpen(false)}
            >
              ביטול
            </button>
          </>
        }
      >
        <form
          id="expense-form"
          onSubmit={expenseForm.handleSubmit((values) => createExpense.mutateAsync(values))}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-category" className="label">
                קטגוריה
              </label>
              <input
                id="expense-category"
                className={`input ${expenseForm.formState.errors.category ? 'input-error' : ''}`}
                {...expenseForm.register('category')}
              />
              {expenseForm.formState.errors.category && (
                <p className="mt-1 text-xs text-error">
                  {expenseForm.formState.errors.category.message}
                </p>
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
                className={`input text-numeric ${
                  expenseForm.formState.errors.amount ? 'input-error' : ''
                }`}
                {...expenseForm.register('amount')}
              />
              {expenseForm.formState.errors.amount && (
                <p className="mt-1 text-xs text-error">
                  {expenseForm.formState.errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="expense-currency" className="label">
                מטבע
              </label>
              <select id="expense-currency" className="input" {...expenseForm.register('currency')}>
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
                {...expenseForm.register('occurredAt')}
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
              {...expenseForm.register('description')}
            />
          </div>

          {createExpense.isError && (
            <p className="text-xs text-error" role="alert">
              {createExpense.error instanceof Error
                ? createExpense.error.message
                : 'שמירת ההוצאה נכשלה'}
            </p>
          )}
        </form>
      </Modal>
    </div>
  );
}
