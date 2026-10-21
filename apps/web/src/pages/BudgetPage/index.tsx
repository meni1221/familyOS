import { useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconPlus, IconWallet } from '@tabler/icons-react';
import { api } from '../../lib/api';
import { errorMessage } from '../../lib/errorMessage';
import { useCurrentFamily } from '../../hooks/useFamily';
import { useToast } from '../../hooks/useToast';
import LoadMore from '../../components/ui/LoadMore';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { Budget, Currency, Expense, Page } from '../../lib/types';
import BudgetSummary from './BudgetSummary';
import BudgetList from './BudgetList';
import ExpenseList from './ExpenseList';
import BudgetFormModal from './BudgetFormModal';
import ExpenseFormModal from './ExpenseFormModal';
import type { BudgetFormData, ExpenseFormData } from './schemas';

const EXPENSES_PAGE_SIZE = 30;

interface BudgetSummaryData {
  monthlyExpenses: number;
  budgetTotal: number;
  remaining: number;
}

const fetchExpensePage = async (offset: number): Promise<Page<Expense>> => {
  const params = new URLSearchParams({
    limit: String(EXPENSES_PAGE_SIZE),
    offset: String(offset),
  });
  return api.get<Page<Expense>>(`/api/v1/budget/expenses?${params.toString()}`);
};

/**
 * The family budget: what was budgeted, what was spent this month, and the two
 * dialogs that add to either list. The pieces live next to this file.
 */
const BudgetPage = () => {
  const client = useQueryClient();
  const toast = useToast();
  const { data: family } = useCurrentFamily();
  const defaultCurrency: Currency = family?.defaultCurrency ?? 'ILS';

  const [budgetFormOpen, setBudgetFormOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);

  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budget'],
    queryFn: async () => (await api.get<{ data: Budget[] }>('/api/v1/budget')).data ?? [],
  });

  const {
    data: expensePages,
    isLoading: expensesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['budget', 'expenses'],
    queryFn: ({ pageParam }) => fetchExpensePage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length * EXPENSES_PAGE_SIZE : undefined,
  });

  const expenses = expensePages?.pages.flatMap((page) => page.data) ?? [];

  // The totals cover every expense of the month, not only the pages the
  // browser has loaded, so they are asked for rather than added up here.
  const { data: summary } = useQuery({
    queryKey: ['budget', 'summary'],
    queryFn: async () =>
      (await api.get<{ data: BudgetSummaryData }>('/api/v1/budget/summary')).data,
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
      toast.success('התקציב נשמר');
    },
    onError: (error) => toast.error('שמירת התקציב נכשלה', errorMessage(error)),
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/budget/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('התקציב נמחק');
    },
    onError: (error) => toast.error('מחיקת התקציב נכשלה', errorMessage(error)),
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
      toast.success('ההוצאה נוספה');
    },
    onError: (error) => toast.error('הוספת ההוצאה נכשלה', errorMessage(error)),
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => api.del(`/api/v1/budget/expenses/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('ההוצאה נמחקה');
    },
    onError: (error) => toast.error('מחיקת ההוצאה נכשלה', errorMessage(error)),
  });

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
        monthlyExpenses={summary?.monthlyExpenses ?? 0}
        budgetTotal={summary?.budgetTotal ?? 0}
        remaining={summary?.remaining ?? 0}
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
        expenses={expenses}
        isDeleting={deleteExpense.isPending}
        onCreate={() => setExpenseFormOpen(true)}
        onDelete={(id) => deleteExpense.mutate(id)}
      />

      <LoadMore
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onClick={() => void fetchNextPage()}
        label="עוד הוצאות"
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
};

export default BudgetPage;
