import { Link } from 'react-router-dom';
import Reveal from '../../../components/ui/Reveal';

/** The closing call to action. */
const LandingCta = () => {
  return (
    <section className="px-4 py-16 md:py-24">
      <Reveal className="mx-auto max-w-content">
        <div className="relative overflow-hidden rounded-16 bg-forest px-6 py-12 text-center md:px-12 md:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 end-[-4rem] h-56 w-56 rounded-full bg-gold/20 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 start-[-3rem] h-56 w-56 rounded-full bg-sage/20 blur-2xl"
          />

          <div className="relative">
            <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl">מוכנים להתחיל?</h2>
            <p className="mx-auto mb-8 max-w-xl text-white/75">
              הצטרפו למשפחות שמנהלות את חייהן בצורה חכמה יותר — בעברית, בלי עומס ובלי כרטיס אשראי.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-4 bg-gold px-6 py-3 text-sm font-semibold text-forest-deep transition-colors duration-150 hover:bg-gold-light"
            >
              צרו משפחה חינם
            </Link>
            <p className="mt-4 text-caption text-white/60">
              אפשר להוריד עותק של הנתונים ולמחוק את החשבון בכל רגע
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default LandingCta;
