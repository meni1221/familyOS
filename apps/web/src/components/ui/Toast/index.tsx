import type { ComponentType } from 'react';
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react';
import type { ToastRecord, ToastVariant } from './context';

interface VariantStyle {
  icon: ComponentType<{ className?: string }>;
  /** Shell and icon colours, all from the brand palette. */
  shell: string;
  iconClass: string;
}

const VARIANT_STYLES: Record<ToastVariant, VariantStyle> = {
  success: {
    icon: IconCircleCheck,
    shell: 'border-success/30 bg-success-light',
    iconClass: 'text-success',
  },
  error: {
    icon: IconAlertTriangle,
    shell: 'border-error/30 bg-error-light',
    iconClass: 'text-error',
  },
  warning: {
    icon: IconAlertTriangle,
    shell: 'border-warning/30 bg-warning-light',
    iconClass: 'text-warning',
  },
  info: {
    icon: IconInfoCircle,
    shell: 'border-border bg-surface',
    iconClass: 'text-forest',
  },
};

interface ToastProps {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
  /** Hovering or focusing a toast stops its countdown. */
  onPause: (id: number) => void;
  onResume: (id: number) => void;
}

/** One message: icon, text, and the way out. */
export default function Toast({ toast, onDismiss, onPause, onResume }: ToastProps) {
  const { icon: Icon, shell, iconClass } = VARIANT_STYLES[toast.variant];

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      onMouseEnter={() => onPause(toast.id)}
      onMouseLeave={() => onResume(toast.id)}
      onFocus={() => onPause(toast.id)}
      onBlur={() => onResume(toast.id)}
      className={`toast-enter pointer-events-auto flex w-full items-start gap-3 rounded-12 border p-3 shadow-modal ${shell}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{toast.message}</p>
        {toast.description && (
          <p className="mt-0.5 break-words text-xs text-ink-secondary">{toast.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="סגירת ההודעה"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-4 text-ink-secondary transition-colors hover:bg-cream hover:text-ink"
      >
        <IconX className="h-4 w-4" />
      </button>
    </div>
  );
}
