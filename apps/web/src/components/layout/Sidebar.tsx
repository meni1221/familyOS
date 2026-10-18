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

/**
 * Starts below the full-width header (`top-20`, matching its height) and the
 * brand now lives in that header, so there is no logo row here.
 */
export default function Sidebar() {
  return (
    <aside className="fixed bottom-0 start-0 top-20 z-20 hidden w-60 flex-col border-e border-border bg-surface md:flex">
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
