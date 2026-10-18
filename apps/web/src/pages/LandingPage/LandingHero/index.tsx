import { Link } from 'react-router-dom';

/** The first screen: the promise and the two calls to action. */
export default function LandingHero() {
  return (
    <section className="mx-auto max-w-content px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold leading-tight text-ink md:text-5xl">
          כל מה שהמשפחה צריכה, במקום אחד
        </h1>
        <p className="mb-8 text-lg text-ink-secondary">
          פחות עומס מנטלי. יותר זמן למה שחשוב.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register" className="btn-primary w-full sm:w-auto">
            התחילו בחינם
          </Link>
          <a href="#features" className="btn-secondary w-full sm:w-auto">
            גלושו בתכונות
          </a>
        </div>
      </div>
    </section>
  );
}
