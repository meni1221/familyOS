import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconWallet } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { useCurrentFamily } from '../../hooks/useFamily';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Budget, Currency, Expense } from '../../lib/types';
import BudgetSummary from './BudgetSummary';
import BudgetList from './BudgetList';
import ExpenseList from './ExpenseList';
import BudgetFormModal from './BudgetFormModal';
import ExpenseFormModal from './ExpenseFormModal';
import type { BudgetFormData, ExpenseFormData } from './schemas';

/**
 * The family budget: what was budgeted, what was spent this month, and the two
 * dialogs that add to either list. The pieces live next to this file.
 */
export default function BudgetPage() {
  const client = useQueryClient();
  const { data: family } = useCurrentFamily();
  const defaultCurrency: Currency = family?.defaultCurrency ?? 'ILS';

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
          <button type="button" className="btn-secondary btn-sm" onClick={() => setBudgetFormOpen(true)}>
            <IconWallet className="h-4 w-4" />
            תקציב חדש
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={() => setExpenseFormOpen(true)}>
            <IconPlus className="h-4 w-4" />
            הוצאה חדשה
          </button>
        </div>
      </div>

      <BudgetSummary
        monthlyExpenses={summary.monthlyExpenses}
        budgetTotal={summary.budgetTotal}
        remaining={summary.remaining}
        currency={defaultCurrency}
      />

      {(deleteExpense.isError || deleteBudget.isError) && (
        <p className="mb-3 text-sm text-error" role="alert">
          המחיקה נכשלה. נסו שוב.
        </p>
      )}

      <BudgetList
        budgets={budgets ?? []}
        isDeleting={deleteBudget.isPending}
        onCreate={() => setBudgetFormOpen(true)}
        onDelete={(id) => deleteBudget.mutate(id)}
      />

      <ExpenseList
        expenses={expenses ?? []}
        isDeleting={deleteExpense.isPending}
        onCreate={() => setExpenseFormOpen(true)}
        onDelete={(id) => deleteExpense.mutate(id)}
      />

      <BudgetFormModal
        open={budgetFormOpen}
        defaultCurrency={defaultCurrency}
        isPending={createBudget.isPending}
        error={createBudget.error}
        onClose={() => setBudgetFormOpen(false)}
        onSubmit={(values) => createBudget.mutate(values)}
      />

      <ExpenseFormModal
        open={expenseFormOpen}
        defaultCurrency={defaultCurrency}
        isPending={createExpense.isPending}
        error={createExpense.error}
        onClose={() => setExpenseFormOpen(false)}
        onSubmit={(values) => createExpense.mutate(values)}
      />
    </div>
  );
}
