import { IconBell, IconChevronDown } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import AccessibilityMenu from '../accessibility/AccessibilityMenu';

// Custom accessibility icon since Tabler doesn't have IconUniversalAccess
const IconUniversalAccess = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export default function Header() {
  const { user } = useAuth();
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 md:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-4 bg-forest">
            <span className="text-sm font-bold text-white">F</span>
          </div>
          <span className="text-lg font-bold text-ink">FamilyOS</span>
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
          <button
            onClick={() => setIsAccessibilityOpen(true)}
            className="w-10 h-10 rounded-4 flex items-center justify-center border border-border bg-surface text-ink-secondary hover:bg-cream hover:text-forest transition-colors"
            aria-label="תפריט נגישות"
          >
            <IconUniversalAccess className="h-5 w-5" />
          </button>
        </div>
      </header>
      {isAccessibilityOpen && (
        <AccessibilityMenu
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
        />
      )}
    </>
  );
}
