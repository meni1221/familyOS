import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconCheck,
  IconCalendar,
  IconBabyBottle,
  IconWallet,
  IconBell,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';

/**
 * Every screen in the app, in one row.
 *
 * Below `lg` there is no sidebar to hide a destination in: settings and the
 * profile used to live only in the account menu, which made the bottom bar a
 * partial map of the product. Eight short labels fit from 320px up.
 */
const navItems = [
  { to: '/app', icon: IconLayoutDashboard, label: 'סקירה', end: true },
  { to: '/app/tasks', icon: IconCheck, label: 'משימות' },
  { to: '/app/calendar', icon: IconCalendar, label: 'יומן' },
  { to: '/app/baby', icon: IconBabyBottle, label: 'תינוק' },
  { to: '/app/budget', icon: IconWallet, label: 'תקציב' },
  { to: '/app/notifications', icon: IconBell, label: 'התראות' },
  { to: '/app/settings', icon: IconSettings, label: 'הגדרות' },
  { to: '/app/profile', icon: IconUser, label: 'פרופיל' },
];

const MobileNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-forest' : 'text-ink-secondary'
            }`
          }
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="w-full truncate text-center leading-tight">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
