import Footer from '../../components/layout/Footer';
import { useSeo } from '../../hooks/useSeo';
import { SITE_TAGLINE } from '../../lib/seo';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import FeatureGrid from './FeatureGrid';
import HowItWorks from './HowItWorks';
import SecuritySection from './SecuritySection';
import LandingCta from './LandingCta';

/**
 * The public front door. Each band of the page is its own component next to
 * this file; the copy they render lives in `content.ts`.
 */
export default function LandingPage() {
  useSeo({ title: SITE_TAGLINE, path: '/' });

  return (
    <div className="min-h-screen bg-canvas">
      <LandingHeader />

      <main id="main-content">
        <LandingHero />
        <FeatureGrid />
        <HowItWorks />
        <SecuritySection />
        <LandingCta />
      </main>

      <Footer />
    </div>
  );
}
