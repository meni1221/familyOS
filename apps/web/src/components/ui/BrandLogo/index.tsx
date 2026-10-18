import { Link } from 'react-router-dom';

const LOGO_SIZES = {
  sm: { image: 'h-8 w-8', text: 'text-lg' },
  md: { image: 'h-10 w-10', text: 'text-xl' },
  // The app header uses `lg`. It grows from `md` upwards so the wider brand
  // still fits next to the header actions on narrow phones.
  lg: { image: 'h-12 w-12 md:h-14 md:w-14', text: 'text-2xl md:text-3xl' },
} as const;

interface BrandLogoProps {
  /** When provided the mark becomes a link (usually pointing home). */
  to?: string;
  size?: keyof typeof LOGO_SIZES;
  className?: string;
}

/**
 * The FamilyOS brand mark + wordmark.
 * The image is decorative (alt="") because the wordmark already carries the
 * accessible name, avoiding a duplicated announcement in screen readers.
 */
export default function BrandLogo({ to, size = 'sm', className = '' }: BrandLogoProps) {
  const styles = LOGO_SIZES[size];

  const content = (
    <>
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className={`${styles.image} shrink-0 rounded-4`}
      />
      <span className={`${styles.text} font-bold text-ink`}>FamilyOS</span>
    </>
  );

  const classes = `inline-flex items-center gap-2 ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="FamilyOS — לדף הבית">
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
