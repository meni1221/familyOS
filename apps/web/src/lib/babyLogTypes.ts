import type { ComponentType } from 'react';
import { IconBabyBottle, IconDroplets, IconFile, IconMoon } from '@tabler/icons-react';
import type { BabyLogType } from './types';

export interface LogTypeMeta {
  type: BabyLogType;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

/** The four things worth recording about a baby's day. */
export const LOG_TYPES: LogTypeMeta[] = [
  { type: 'FEEDING', icon: IconBabyBottle, label: 'הזנה' },
  { type: 'SLEEP', icon: IconMoon, label: 'שינה' },
  { type: 'DIAPER', icon: IconDroplets, label: 'חיתול' },
  { type: 'NOTE', icon: IconFile, label: 'הערה' },
];

/** The label of one log type, for the places that only show text. */
export const logTypeLabel = (type: BabyLogType): string => {
  return LOG_TYPES.find((item) => item.type === type)?.label ?? type;
};
