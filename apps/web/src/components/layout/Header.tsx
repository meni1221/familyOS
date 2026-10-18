import { useEffect, useRef, useState } from 'react';
import { IconBell, IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../hooks/useAuth';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import BrandLogo from '../ui/BrandLogo';

export default function Header() {
  const { user } = useAuth();
  const unreadCount = useUnreadCount();
  const logout = useLogout();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu on Escape or on a click outside of it.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

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
          aria-label={
            unreadCount > 0 ? `התראות, ${unreadCount} שלא נקראו` : 'התראות'
          }
        >
          <IconBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -end-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-4 px-2 py-1 text-ink transition-colors hover:bg-cream"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-light text-sm font-semibold text-forest">
              {user?.displayName?.charAt(0) ?? '?'}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium md:block">
              {user?.displayName ?? 'משתמש'}
            </span>
            <IconChevronDown className="hidden h-4 w-4 text-ink-secondary md:block" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute end-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-12 border border-border bg-surface shadow-modal"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-sm font-medium text-ink">
                  {user?.displayName ?? 'משתמש'}
                </p>
                <p className="truncate text-xs text-ink-secondary">{user?.email}</p>
              </div>

              <Link
                to="/app/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-ink transition-colors hover:bg-cream"
              >
                <IconSettings className="h-4 w-4 text-ink-secondary" />
                הגדרות
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-start text-sm text-error transition-colors hover:bg-cream"
              >
                <IconLogout className="h-4 w-4" />
                התנתקות
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
