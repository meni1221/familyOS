import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { IconCheck } from '@tabler/icons-react';
import { gsap, isMotionReduced } from '../../../lib/motion';
import HeroPreview from '../HeroPreview';

const TRUST = ['בלי כרטיס אשראי', 'עברית מלאה', 'נגישות בכל עמוד'];

/** The first screen: the promise, the two calls to action and the product. */
const LandingHero = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || isMotionReduced()) return;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-hero="eyebrow"]', { opacity: 0, y: 10, duration: 0.35 })
        .from('[data-hero="title"]', { opacity: 0, y: 16, duration: 0.55 }, '-=0.15')
        .from('[data-hero="lede"]', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3')
        .from('[data-hero="cta"]', { opacity: 0, y: 12, duration: 0.45 }, '-=0.3')
        .from('[data-hero="trust"] > *', { opacity: 0, y: 8, duration: 0.35, stagger: 0.06 }, '-=0.25')
        .from(
          '[data-hero="preview"]',
          { opacity: 0, y: 24, scale: 0.98, duration: 0.7 },
          '-=0.55'
        );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 end-[-10rem] h-80 w-80 rounded-full bg-sage-light/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 start-[-8rem] h-72 w-72 rounded-full bg-gold-light/70 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-content items-center gap-14 px-4 py-16 md:grid-cols-2 md:gap-10 md:py-24">
        <div>
          <p
            data-hero="eyebrow"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-caption font-medium text-forest"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            ניהול משפחה בעברית · בחינם
          </p>

          <h1
            data-hero="title"
            className="mb-4 text-4xl font-bold leading-tight text-ink md:text-5xl md:leading-tight"
          >
            כל מה שהמשפחה צריכה, במקום אחד
          </h1>

          <p data-hero="lede" className="mb-8 max-w-xl text-lg text-ink-secondary">
            פחות עומס מנטלי. יותר זמן למה שחשוב. משימות, יומן, שגרת תינוק ותקציב הבית — לכל המשפחה,
            בכל מכשיר.
          </p>

          <div
            data-hero="cta"
            className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
          >
            <Link to="/register" className="btn-primary">
              התחילו בחינם
            </Link>
            <a href="#features" className="btn-secondary">
              גלושו בתכונות
            </a>
          </div>

          <ul
            data-hero="trust"
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-ink-secondary"
          >
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <IconCheck className="h-3.5 w-3.5 text-forest" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div data-hero="preview">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
