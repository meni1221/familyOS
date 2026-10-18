import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconCheck,
  IconCalendar,
  IconBabyBottle,
  IconWallet,
} from '@tabler/icons-react';

const navItems = [
  { to: '/app', icon: IconLayoutDashboard, label: 'סקירה', end: true },
  { to: '/app/tasks', icon: IconCheck, label: 'משימות' },
  { to: '/app/calendar', icon: IconCalendar, label: 'יומן' },
  { to: '/app/baby', icon: IconBabyBottle, label: 'תינוק' },
  { to: '/app/budget', icon: IconWallet, label: 'תקציב' },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
              isActive ? 'text-forest' : 'text-ink-secondary'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
