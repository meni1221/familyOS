import { Link } from 'react-router-dom';

/** The closing call to action. */
const LandingCta = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold text-ink">מוכנים להתחיל?</h2>
        <p className="mb-8 text-ink-secondary">
          הצטרפו למשפחות שמנהלות את חייהן בצורה חכמה יותר
        </p>
        <Link to="/register" className="btn-primary">
          צרו משפחה חינם
        </Link>
      </div>
    </section>
  );
};

export default LandingCta;
