import { useEffect, useRef, useState } from 'react';
import { IconBell, IconLogout, IconSettings, IconUser } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useLogout } from '../../../hooks/useAuth';
import { useUnreadCount } from '../../../hooks/useUnreadCount';
import BrandLogo from '../../ui/BrandLogo';

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
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-border bg-surface px-4 md:px-6">
      <BrandLogo to="/app" size="lg" />

      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/app/notifications"
          className="relative flex h-11 w-11 items-center justify-center rounded-4 text-ink-secondary transition-colors hover:bg-cream hover:text-ink"
          aria-label={
            unreadCount > 0 ? `התראות, ${unreadCount} שלא נקראו` : 'התראות'
          }
        >
          <IconBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          {/* The initials are the trigger; the name lives inside the menu. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={`חשבון: ${user?.displayName ?? 'משתמש'}`}
            title={user?.displayName ?? 'החשבון שלי'}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sage-light text-base font-semibold text-forest transition-colors hover:bg-sand"
          >
            {user?.displayName?.charAt(0) ?? '?'}
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute end-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-12 border border-border bg-surface shadow-modal"
            >
              <div className="border-b border-border px-4 py-3">
                <p className="truncate text-base font-semibold text-ink">
                  {user?.displayName ?? 'משתמש'}
                </p>
                <p className="truncate text-sm text-ink-secondary">{user?.email}</p>
              </div>

              <Link
                to="/app/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base text-ink transition-colors hover:bg-cream"
              >
                <IconUser className="h-5 w-5 text-ink-secondary" />
                הפרופיל שלי
              </Link>

              <Link
                to="/app/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 border-t border-border px-4 py-3 text-base text-ink transition-colors hover:bg-cream"
              >
                <IconSettings className="h-5 w-5 text-ink-secondary" />
                הגדרות
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-start text-base text-error transition-colors hover:bg-cream"
              >
                <IconLogout className="h-5 w-5" />
                התנתקות
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
