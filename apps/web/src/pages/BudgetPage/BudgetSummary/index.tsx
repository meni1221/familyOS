import { formatCurrency } from '../../../lib/format';

interface BudgetSummaryProps {
  /** Expenses recorded in the current calendar month. */
  monthlyExpenses: number;
  /** Sum of the monthly budgets. */
  budgetTotal: number;
  /** What is left of the monthly budget. */
  remaining: number;
  currency: string;
}

/** The three numbers people open the budget screen for. */
const BudgetSummary = ({
  monthlyExpenses,
  budgetTotal,
  remaining,
  currency,
}: BudgetSummaryProps) => {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-3">
      <div className="card">
        <p className="text-label mb-1">הוצאות החודש</p>
        <p className="text-2xl font-bold text-error text-numeric">
          {formatCurrency(monthlyExpenses, currency)}
        </p>
      </div>
      <div className="card">
        <p className="text-label mb-1">תקציב חודשי</p>
        <p className="text-2xl font-bold text-ink text-numeric">
          {formatCurrency(budgetTotal, currency)}
        </p>
      </div>
      <div className="card">
        <p className="text-label mb-1">נותר</p>
        <p
          className={`text-2xl font-bold text-numeric ${
            remaining < 0 ? 'text-error' : 'text-success'
          }`}
        >
          {formatCurrency(remaining, currency)}
        </p>
      </div>
    </div>
  );
};

export default BudgetSummary;
