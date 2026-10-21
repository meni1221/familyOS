import Footer from '../../components/layout/Footer';
import { useSeo } from '../../hooks/useSeo';
import { publicPageSeo } from '../../lib/seo';
import LandingHeader from './LandingHeader';
import LandingHero from './LandingHero';
import FeatureGrid from './FeatureGrid';
import HowItWorks from './HowItWorks';
import SecuritySection from './SecuritySection';
import Faq from './Faq';
import LandingCta from './LandingCta';

/**
 * The public front door. Each band of the page is its own component next to
 * this file; the copy they render lives in `content.ts`.
 */
const LandingPage = () => {
  useSeo({ ...publicPageSeo('/'), path: '/' });

  return (
    <div className="min-h-screen bg-canvas">
      <LandingHeader />

      <main id="main-content">
        <LandingHero />
        <FeatureGrid />
        <HowItWorks />
        <SecuritySection />
        <Faq />
        <LandingCta />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
