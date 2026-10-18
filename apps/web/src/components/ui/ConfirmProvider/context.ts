import { createContext } from 'react';

export interface ConfirmOptions {
  /** The question, e.g. "למחוק את המשימה?". */
  title: string;
  /** What will happen, and what cannot be undone. */
  description?: string;
  /** Defaults to "אישור". Use a verb: "מחיקה", "ביטול ההזמנה". */
  confirmLabel?: string;
  /** Defaults to "ביטול". */
  cancelLabel?: string;
  /** `danger` paints the confirming button in the error colour. */
  tone?: 'default' | 'danger';
}

/** Resolves to `true` when the user confirmed, `false` on cancel/Escape/backdrop. */
export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);
