import { STEPS } from '../content';
import SectionHeading from '../SectionHeading';

/** Three numbered steps, from signing up to running the family. */
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <SectionHeading title="איך זה עובד" subtitle="שלושה שלבים פשוטים" />
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-lg font-bold text-white">
                {item.step}
              </div>
              <h3 className="mb-2 text-base font-semibold text-ink">{item.title}</h3>
              <p className="text-sm text-ink-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
