import Reveal from '../../../components/ui/Reveal';
import { FEATURES } from '../content';
import SectionHeading from '../SectionHeading';

/** What the product does, one card per pillar. */
const FeatureGrid = () => {
  return (
    <section id="features" className="border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <Reveal>
          <SectionHeading
            eyebrow="חמישה כלים, מקום אחד"
            title="כל מה שהמשפחה שלכם צריכה"
            subtitle="כלים פשוטים לניהול החיים המשפחתיים"
          />
        </Reveal>

        <Reveal
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          stagger={0.06}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              data-reveal-item
              className="card transition-transform duration-200 ease-out hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex rounded-4 bg-sage-light p-3">
                <feature.icon className="h-5 w-5 text-forest" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-ink-secondary">{feature.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default FeatureGrid;
