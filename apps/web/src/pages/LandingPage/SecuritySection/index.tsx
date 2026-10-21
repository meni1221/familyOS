import Reveal from '../../../components/ui/Reveal';
import { BENEFITS } from '../content';
import SectionHeading from '../SectionHeading';

/** The privacy and calm argument, as a two-column list. */
const SecuritySection = () => {
  return (
    <section id="security" className="border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <Reveal>
          <SectionHeading
            eyebrow="שקט נפשי"
            title="אבטחה ופרטיות"
            subtitle="הנתונים שלכם שייכים לכם"
          />
        </Reveal>

        <Reveal className="grid gap-4 md:grid-cols-2" stagger={0.07}>
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              data-reveal-item
              className="flex gap-4 rounded-12 border border-border/70 bg-canvas/50 p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-4 bg-sage-light">
                <benefit.icon className="h-5 w-5 text-forest" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-semibold text-ink">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-ink-secondary">{benefit.description}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default SecuritySection;
