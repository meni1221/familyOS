import clsx from 'clsx';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-success',
    warning: 'bg-amber-100 text-warning',
    error: 'bg-red-100 text-error',
    neutral: 'bg-cream text-ink-secondary',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-4 px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
