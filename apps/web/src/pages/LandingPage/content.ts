import type { ComponentType } from 'react';
import {
  IconAccessible,
  IconBabyBottle,
  IconBell,
  IconCalendar,
  IconCheck,
  IconHeart,
  IconShield,
  IconSparkles,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';

export interface LandingItem {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

/** The product pillars shown in the features grid. */
export const FEATURES: LandingItem[] = [
  {
    icon: IconCheck,
    title: 'משימות משפחתיות',
    description: 'ניהול משימות משותף עם הקצאת אחריות, עדיפויות ותאריכי יעד',
  },
  {
    icon: IconCalendar,
    title: 'יומן משפחתי',
    description: 'סינכרון אירועים, פגישות ומסגרות זמן لكل בני המשפחה',
  },
  {
    icon: IconBabyBottle,
    title: 'שגרת התינוק',
    description: 'מעקב הזנה, שינה וחיתולים — גם לתאומים, עם סיכומים יומיים',
  },
  {
    icon: IconWallet,
    title: 'תקציב משפחתי',
    description: 'ניהול הוצאות והכנסות עם סיכומים לפי קטגוריות',
  },
  {
    icon: IconAccessible,
    title: 'עברית ונגישות',
    description: 'ממשק עברי מלא, קיצורי מקלדת ווידג׳ט נגישות בכל עמוד',
  },
  {
    icon: IconBell,
    title: 'התראות חכמות',
    description: 'תזכורות בזמן על משימות ואירועים',
  },
];

/** The value promises shown in the security section. */
export const BENEFITS: LandingItem[] = [
  {
    icon: IconHeart,
    title: 'פחות עומס מנטלי',
    description: 'כל המידע במקום אחד — לא צריך לזכור כלום',
  },
  {
    icon: IconUsers,
    title: 'שיתוף פעולה אמיתי',
    description: 'כל בני המשפחה רואים את אותה תמונה',
  },
  {
    icon: IconShield,
    title: 'פרטיות מלאה',
    description: 'הנתונים שלכם שייכים לכם — ואינם משמשים לפרסום',
  },
  {
    icon: IconSparkles,
    title: 'חוויה פרימיום',
    description: 'עיצוב שמרגיש כמו מוצר אמיתי, לא כמו כלי ניהול',
  },
];

export const NAV_LINKS = [
  { href: '#features', label: 'תכונות' },
  { href: '#how-it-works', label: 'איך זה עובד' },
  { href: '#security', label: 'אבטחה' },
  { href: '#faq', label: 'שאלות' },
];

/** The three onboarding steps. */
export const STEPS = [
  { step: '1', title: 'צרו משפחה', description: 'הרשמו וצרו סביבת עבודה משפחתית' },
  { step: '2', title: 'זמנו בני משפחה', description: 'שלחו הזמנות לבני משפחה אחרים' },
  { step: '3', title: 'תחילו לתאם', description: 'צרו משימות, אירועים ותקציב משותף' },
];
