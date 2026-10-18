import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconCheck,
  IconCalendar,
  IconBabyBottle,
  IconWallet,
  IconFile,
  IconSettings,
} from '@tabler/icons-react';

const navItems = [
  { to: '/app', icon: IconLayoutDashboard, label: 'סקירה כללית', end: true },
  { to: '/app/tasks', icon: IconCheck, label: 'משימות' },
  { to: '/app/calendar', icon: IconCalendar, label: 'יומן משפחתי' },
  { to: '/app/baby', icon: IconBabyBottle, label: 'שגרת התינוק' },
  { to: '/app/budget', icon: IconWallet, label: 'תקציב' },
  { to: '/app/documents', icon: IconFile, label: 'מסמכים' },
  { to: '/app/settings', icon: IconSettings, label: 'הגדרות' },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-border bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-4 bg-forest">
          <span className="text-sm font-bold text-white">F</span>
        </div>
        <span className="text-lg font-bold text-ink">FamilyOS</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
