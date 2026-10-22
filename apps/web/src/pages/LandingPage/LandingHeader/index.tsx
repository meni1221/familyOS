import { Link } from 'react-router-dom';
import BrandLogo from '../../../components/ui/BrandLogo';
import { NAV_LINKS } from '../content';

/**
 * The public header.
 *
 * Below `md` the links live in a single row under the brand bar instead of a
 * hamburger: every destination stays one tap away, and nothing hides behind a
 * panel that has to be opened and closed.
 */
const LandingHeader = () => {
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
        </div>
      </div>

      <nav
        aria-label="ניווט ראשי במובייל"
        className="flex gap-5 overflow-x-auto border-t border-border px-4 py-2 text-sm [scrollbar-width:none] md:hidden"
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="shrink-0 whitespace-nowrap text-ink-secondary hover:text-ink"
          >
            {link.label}
          </a>
        ))}
        <Link
          to="/privacy"
          className="shrink-0 whitespace-nowrap text-ink-secondary hover:text-ink"
        >
          פרטיות
        </Link>
        <Link
          to="/accessibility"
          className="shrink-0 whitespace-nowrap text-ink-secondary hover:text-ink"
        >
          נגישות
        </Link>
      </nav>
    </header>
  );
};

export default LandingHeader;
