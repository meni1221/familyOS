import { IconWallet } from '@tabler/icons-react';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatCurrency } from '../../../lib/format';
import type { Budget } from '../../../lib/types';

interface BudgetListProps {
  budgets: Budget[];
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

/** The budgets the family set up, each in its own currency. */
const BudgetList = ({ budgets, isDeleting, onCreate, onDelete }: BudgetListProps) => {
  return (
    <div className="mb-6">
      <h2 className="section-title mb-3">תקציבים</h2>

      {budgets.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconWallet}
            title="אין תקציבים"
            description="הגדירו תקציב חודשי כדי לעקוב אחרי ההוצאות"
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
                <IconWallet className="h-4 w-4" />
                תקציב חדש
              </button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {budgets.map((budget) => (
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
                disabled={isDeleting}
                onConfirm={() => onDelete(budget.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BudgetList;
