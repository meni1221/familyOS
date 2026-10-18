import {
  IconBell,
  IconCalendar,
  IconChecklist,
  IconCoin,
  IconMail,
  IconTicket,
} from '@tabler/icons-react';
import SectionCard from './SectionCard';
import SwitchRow from '../ui/Switch';
import { useProfile, useUpdatePreferences } from '../../hooks/useSettings';
import type { NotificationPreferences } from '../../lib/types';

const PREFERENCE_FIELDS: Array<{
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    key: 'taskAssigned',
    label: 'משימה שהוקצתה לי',
    description: 'כשמישהו במשפחה מקצה לכם משימה',
    icon: <IconChecklist className="h-4 w-4" />,
  },
  {
    key: 'taskDueSoon',
    label: 'משימה שמתקרבת למועד',
    description: 'תזכורת לפני מועד היעד',
    icon: <IconChecklist className="h-4 w-4" />,
  },
  {
    key: 'eventReminder',
    label: 'תזכורת לאירוע',
    description: 'לפני אירוע ביומן המשפחתי',
    icon: <IconCalendar className="h-4 w-4" />,
  },
  {
    key: 'expenseAdded',
    label: 'הוצאה חדשה',
    description: 'כשנרשמת הוצאה בתקציב המשפחתי',
    icon: <IconCoin className="h-4 w-4" />,
  },
  {
    key: 'weeklySummary',
    label: 'סיכום שבועי',
    description: 'דוח קצר על השבוע שחלף',
    icon: <IconBell className="h-4 w-4" />,
  },
  {
    key: 'email',
    label: 'שליחה באימייל',
    description: 'התראות גם לכתובת האימייל (דורש הגדרת SMTP בשרת)',
    icon: <IconMail className="h-4 w-4" />,
  },
];

export default function PreferencesSection() {
  const { data: profile, isLoading } = useProfile();
  const updatePreferences = useUpdatePreferences();

  const preferences = profile?.notificationPreferences;

  const toggle = (key: keyof NotificationPreferences, next: boolean) => {
    updatePreferences.mutate({ notificationPreferences: { [key]: next } });
  };

  return (
    <SectionCard
      title="העדפות התראות"
      description="בחרו אילו עדכונים תרצו לקבל"
      icon={IconTicket}
    >
      {isLoading || !preferences ? (
        <p className="text-sm text-ink-secondary">טוען…</p>
      ) : (
        <div className="space-y-2">
          {PREFERENCE_FIELDS.map((field) => (
            <SwitchRow
              key={field.key}
              icon={field.icon}
              label={field.label}
              description={field.description}
              checked={preferences[field.key]}
              disabled={updatePreferences.isPending}
              onChange={(next) => toggle(field.key, next)}
            />
          ))}

          {updatePreferences.isError && (
            <p className="text-xs text-error" role="alert">
              {updatePreferences.error instanceof Error
                ? updatePreferences.error.message
                : 'שמירת ההעדפות נכשלה'}
            </p>
          )}
        </div>
      )}
    </SectionCard>
  );
}
