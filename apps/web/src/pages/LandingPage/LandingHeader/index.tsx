import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconMenu2, IconX } from '@tabler/icons-react';
import BrandLogo from '../../../components/ui/BrandLogo';
import { NAV_LINKS } from '../content';

/** The public header: brand, anchors, and the mobile menu panel. */
const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <BrandLogo to="/" />
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="ניווט ראשי">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-ink-secondary hover:text-ink">
              {link.label}
            </a>
          ))}
          <Link to="/privacy" className="text-sm text-ink-secondary hover:text-ink">
            פרטיות
          </Link>
          <Link to="/accessibility" className="text-sm text-ink-secondary hover:text-ink">
            נגישות
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="btn-ghost btn-sm">
            התחברות
          </Link>
          <Link to="/register" className="btn-primary btn-sm">
            הרשמה
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-4 text-ink-secondary transition-colors hover:bg-cream hover:text-ink md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="landing-menu"
            aria-label={isMenuOpen ? 'סגירת תפריט הניווט' : 'פתיחת תפריט הניווט'}
          >
            {isMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* The desktop nav is hidden below `md`, so mobile gets its own panel. */}
      {isMenuOpen && (
        <nav
          id="landing-menu"
          aria-label="ניווט ראשי במובייל"
          className="border-t border-border bg-surface px-4 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setIsMenuOpen(false)} className="nav-item">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/privacy" onClick={() => setIsMenuOpen(false)} className="nav-item">
                פרטיות
              </Link>
            </li>
            <li>
              <Link to="/accessibility" onClick={() => setIsMenuOpen(false)} className="nav-item">
                נגישות
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default LandingHeader;
