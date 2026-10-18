import type { ComponentType } from 'react';
import { IconBabyBottle, IconDroplets, IconFile, IconMoon } from '@tabler/icons-react';
import type { BabyLogType } from '../../lib/types';

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
