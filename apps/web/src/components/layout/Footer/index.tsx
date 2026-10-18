import { Link } from 'react-router-dom';
import BrandLogo from '../../ui/BrandLogo';

interface FooterProps {
  /**
   * The app shell passes bottom padding here so the last line clears the fixed
   * mobile navigation; the marketing page does not need it.
   */
  className?: string;
}

/**
 * The single footer for the whole product — marketing page and app alike — so
 * the brand, the legal links and the credit never drift apart.
 */
export default function Footer({ className = '' }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t border-border bg-surface py-8 print:hidden ${className}`.trim()}
    >
      <div className="mx-auto flex max-w-content flex-col items-center gap-3 px-4 text-center text-sm text-ink-secondary">
        <BrandLogo size="md" />

        <p>כל מה שהמשפחה צריכה, במקום אחד</p>

        <nav aria-label="קישורים בתחתית העמוד" className="flex items-center gap-4">
          <Link to="/privacy" className="transition-colors hover:text-ink">
            מדיניות פרטיות
          </Link>
          <span aria-hidden="true" className="text-border">
            |
          </span>
          <Link to="/accessibility" className="transition-colors hover:text-ink">
            הצהרת נגישות
          </Link>
        </nav>

        <p>
          נבנה על ידי{' '}
          <a
            href="https://levi-tec.menilevi0533011599.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-forest hover:underline"
          >
            levi-tec
          </a>
        </p>

        <p className="text-caption">© {year} FamilyOS</p>
      </div>
    </footer>
  );
}
