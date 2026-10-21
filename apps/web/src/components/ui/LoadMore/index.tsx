import { IconChevronDown } from '@tabler/icons-react';

interface LoadMoreProps {
  /** Whether the server said another page exists. */
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
  label?: string;
}

/**
 * The one "another page" control, so every list asks the same way and stops
 * offering more when the server says there is none.
 */
const LoadMore = ({ hasMore, isLoading, onClick, label = 'עוד רשומות' }: LoadMoreProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-4">
      <button type="button" className="btn-secondary btn-sm" onClick={onClick} disabled={isLoading}>
        <IconChevronDown className="h-4 w-4" />
        {isLoading ? 'טוען…' : label}
      </button>
    </div>
  );
};

export default LoadMore;
