import { IconBell, IconChevronDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BrandLogo from '../ui/BrandLogo';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      <div className="md:hidden">
        <BrandLogo to="/app" />
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2">
        <Link
          to="/app/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-4 text-ink-secondary transition-colors hover:bg-cream hover:text-ink"
          aria-label="התראות"
        >
          <IconBell className="h-5 w-5" />
        </Link>
        <button className="flex items-center gap-2 rounded-4 px-2 py-1 text-ink transition-colors hover:bg-cream">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-forest">
            {user?.displayName?.charAt(0) ?? '?'}
          </div>
          <span className="hidden text-sm font-medium md:block">
            {user?.displayName ?? 'משתמש'}
          </span>
          <IconChevronDown className="hidden h-4 w-4 text-ink-secondary md:block" />
        </button>
      </div>
    </header>
  );
}
