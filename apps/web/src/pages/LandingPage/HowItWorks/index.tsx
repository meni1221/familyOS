import Reveal from '../../../components/ui/Reveal';
import { STEPS } from '../content';
import SectionHeading from '../SectionHeading';

/** Three numbered steps, from signing up to running the family. */
const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <Reveal>
          <SectionHeading
            eyebrow="בדקה הראשונה"
            title="איך זה עובד"
            subtitle="שלושה שלבים פשוטים"
          />
        </Reveal>

        <Reveal className="relative grid gap-10 md:grid-cols-3" stagger={0.12}>
          <div
            aria-hidden="true"
            className="absolute inset-x-[16%] top-6 hidden border-t border-dashed border-border md:block"
          />

          {STEPS.map((item) => (
            <div key={item.step} data-reveal-item className="relative text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white ring-8 ring-canvas">
                {item.step}
              </div>
              <h3 className="mb-2 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink-secondary">
                {item.description}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
