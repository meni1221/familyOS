import { formatCurrency } from '../../../lib/format';
import type { DashboardPayload } from '../../../lib/types';
import DashboardCard from '../DashboardCard';

interface BudgetCardProps {
  budget: DashboardPayload['budget'] | undefined;
}

/** This month's spending against the budget. */
const BudgetCard = ({ budget }: BudgetCardProps) => {
  return (
    <DashboardCard title="תקציב החודש" to="/app/budget">
      {budget ? (
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-secondary">הוצאות</dt>
            <dd className="text-numeric text-error">
              {formatCurrency(budget.monthlyExpenses, 'ILS')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-secondary">תקציב</dt>
            <dd className="text-numeric text-ink">
              {formatCurrency(budget.budgetAmount, 'ILS')}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-secondary">נותר</dt>
            <dd
              className={`text-numeric ${budget.remaining < 0 ? 'text-error' : 'text-success'}`}
            >
              {formatCurrency(budget.remaining, 'ILS')}
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-ink-secondary">אין נתונים</p>
      )}
    </DashboardCard>
  );
};

export default BudgetCard;
