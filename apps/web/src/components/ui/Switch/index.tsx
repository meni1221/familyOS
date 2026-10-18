interface SwitchRowProps {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Accessible on/off row: a real `role="switch"` button with a 24×44px hit area
 * (WCAG 2.2 target size) and the label wired up through `aria-label`.
 */
const SwitchRow = ({
  label,
  checked,
  onChange,
  description,
  icon,
  disabled = false,
}: SwitchRowProps) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-4 border border-border px-3 py-2">
      <span className="flex min-w-0 items-center gap-2">
        {icon && (
          <span className="text-ink-secondary" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="min-w-0">
          <span className="block text-sm text-ink">{label}</span>
          {description && (
            <span className="block text-xs text-ink-secondary">{description}</span>
          )}
        </span>
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          checked ? 'bg-forest' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'end-0.5' : 'start-0.5'
          }`}
        />
      </button>
    </div>
  );
};

export default SwitchRow;
