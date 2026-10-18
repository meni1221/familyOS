import { FEATURES } from '../content';
import SectionHeading from '../SectionHeading';

/** What the product does, one card per pillar. */
const FeatureGrid = () => {
  return (
    <section id="features" className="border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <SectionHeading
          title="כל מה שהמשפחה שלכם צריכה"
          subtitle="כלים פשוטים לניהול החיים המשפחתיים"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card">
              <div className="mb-4 inline-flex rounded-4 bg-sage-light p-3">
                <feature.icon className="h-5 w-5 text-forest" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm text-ink-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
