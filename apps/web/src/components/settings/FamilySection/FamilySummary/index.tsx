import type { CurrentFamily } from '../../../../lib/types';

interface FamilySummaryProps {
  family: CurrentFamily | undefined;
  isLoading: boolean;
}

/** The family name, its size and its default currency. */
export default function FamilySummary({ family, isLoading }: FamilySummaryProps) {
  return (
    <div className="rounded-4 bg-cream px-3 py-2">
      <p className="text-sm font-medium text-ink">
        {isLoading ? 'טוען…' : (family?.name ?? '—')}
      </p>
      <p className="text-xs text-ink-secondary">
        {family?.memberCount ?? 0} חברים · מטבע ברירת מחדל: {family?.defaultCurrency ?? 'ILS'}
      </p>
    </div>
  );
}
