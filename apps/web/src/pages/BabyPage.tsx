import { useState } from 'react';
import { IconBabyBottle, IconPlus, IconDroplets, IconMoon, IconFile } from '@tabler/icons-react';
import EmptyState from '../components/ui/EmptyState';

const logTypes = [
  { type: 'FEEDING', icon: IconBabyBottle, label: 'הזנה' },
  { type: 'SLEEP', icon: IconMoon, label: 'שינה' },
  { type: 'DIAPER', icon: IconDroplets, label: 'חיתול' },
  { type: 'NOTE', icon: IconFile, label: 'הערה' },
];

export default function BabyPage() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'add'>('timeline');

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">שגרת התינוק</h1>
        <button
          className="btn-primary btn-sm"
          onClick={() => setActiveTab(activeTab === 'add' ? 'timeline' : 'add')}
        >
          <IconPlus className="h-4 w-4" />
          {activeTab === 'add' ? 'חזרה לצילול' : 'רשום פעילות'}
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="card">
          <h2 className="section-title mb-4">רשום פעילות חדשה</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {logTypes.map((lt) => (
              <button
                key={lt.type}
                className="flex flex-col items-center gap-2 rounded-8 border border-border bg-surface p-4 transition-colors hover:bg-cream"
              >
                <lt.icon className="h-6 w-6 text-forest" />
                <span className="text-sm font-medium text-ink">{lt.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <EmptyState
            icon={IconBabyBottle}
            title="אין רשומות עדיין"
            description="התחילו לרשום את הפעילות הראשונה של התינוק"
          />
        </div>
      )}
    </div>
  );
}
