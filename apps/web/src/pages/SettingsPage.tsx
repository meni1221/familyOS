import { User, Users, Globe, Bell, Shield, LogOut } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">הגדרות</h1>
      </div>

      <div className="space-y-4">
        {[
          { icon: User, title: 'פרופיל', description: 'שם, אימייל ופרטים אישיים' },
          { icon: Users, title: 'חברי משפחה', description: 'ניהול חברים והזמנות' },
          { icon: Globe, title: 'שפה ואזור זמן', description: 'עברית, עברית' },
          { icon: Bell, title: 'העדפות התראות', description: 'מה ומתי לקבל התראות' },
          { icon: Shield, title: 'אבטחה', description: 'סיסמה, סשנים ואימות' },
        ].map((item) => (
          <div key={item.title} className="card flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-4 bg-sand">
              <item.icon className="h-5 w-5 text-ink-secondary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">{item.title}</p>
              <p className="text-xs text-ink-secondary">{item.description}</p>
            </div>
          </div>
        ))}

        <div className="card flex items-center gap-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-4 bg-red-50">
            <LogOut className="h-5 w-5 text-error" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-error">התנתקות</p>
            <p className="text-xs text-ink-secondary">צאו מהחשבון</p>
          </div>
        </div>
      </div>
    </div>
  );
}
