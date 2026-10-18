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
import BrandLogo from '../ui/BrandLogo';

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
      <div className="flex h-16 items-center border-b border-border px-6">
        <BrandLogo to="/app" />
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
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
