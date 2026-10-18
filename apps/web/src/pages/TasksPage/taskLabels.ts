export const statusLabels: Record<string, string> = {
  OPEN: 'פתוחה',
  IN_PROGRESS: 'בתהליך',
  COMPLETED: 'הושלמה',
};

export const priorityLabels: Record<string, string> = {
  LOW: 'נמוכה',
  MEDIUM: 'בינונית',
  HIGH: 'גבוהה',
  URGENT: 'דחופה',
};

export const priorityVariants: Record<string, 'neutral' | 'warning' | 'error'> = {
  LOW: 'neutral',
  MEDIUM: 'neutral',
  HIGH: 'warning',
  URGENT: 'error',
};
