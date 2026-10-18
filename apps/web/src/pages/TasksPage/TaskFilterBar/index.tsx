import type { TaskFilter } from '../types';

const FILTERS: Array<{ value: TaskFilter; label: string }> = [
  { value: 'all', label: 'הכל' },
  { value: 'open', label: 'פתוחות' },
  { value: 'completed', label: 'הושלמו' },
];

interface TaskFilterBarProps {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

/** All / open / completed, as one row of toggle buttons. */
export default function TaskFilterBar({ filter, onChange }: TaskFilterBarProps) {
  return (
    <div className="mb-4 flex gap-2">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          aria-pressed={filter === item.value}
          className={`rounded-4 px-4 py-2 text-sm font-medium transition-colors ${
            filter === item.value
              ? 'bg-forest text-white'
              : 'bg-cream text-ink-secondary hover:bg-border'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
