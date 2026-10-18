import { BENEFITS } from '../content';
import SectionHeading from '../SectionHeading';

/** The privacy and calm argument, as a two-column list. */
const SecuritySection = () => {
  return (
    <section id="security" className="border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <SectionHeading title="אבטחה ופרטיות" subtitle="הנתונים שלכם שייכים לכם" />
        <div className="grid gap-6 md:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4 bg-sage-light">
                <benefit.icon className="h-5 w-5 text-forest" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-ink">{benefit.title}</h3>
                <p className="text-sm text-ink-secondary">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
