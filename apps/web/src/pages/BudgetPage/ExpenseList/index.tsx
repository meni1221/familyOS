import { IconCoin, IconPlus } from '@tabler/icons-react';
import Badge from '../../../components/ui/Badge';
import DeleteButton from '../../../components/ui/DeleteButton';
import EmptyState from '../../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../../lib/format';
import type { Expense } from '../../../lib/types';

interface ExpenseListProps {
  expenses: Expense[];
  /** A deletion is in flight, so every delete button waits. */
  isDeleting: boolean;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

/** Every expense recorded, newest first as the API returns them. */
export default function ExpenseList({ expenses, isDeleting, onCreate, onDelete }: ExpenseListProps) {
  return (
    <div>
      <h2 className="section-title mb-3">הוצאות</h2>

      {expenses.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={IconCoin}
            title="אין הוצאות"
            description="התחילו להזין הוצאות כדי לראות את התמונה הכוללת"
            action={
              <button type="button" className="btn-primary btn-sm" onClick={onCreate}>
                <IconPlus className="h-4 w-4" />
                הוצאה חדשה
              </button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-2">
          {expenses.map((expense) => (
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
                disabled={isDeleting}
                onConfirm={() => onDelete(expense.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
