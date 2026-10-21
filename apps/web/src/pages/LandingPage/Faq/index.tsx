import { IconChevronDown } from '@tabler/icons-react';
import Reveal from '../../../components/ui/Reveal';
import { FAQ } from '../../../lib/seo';
import SectionHeading from '../SectionHeading';

/**
 * The questions a person asks before signing up, answered where they are asked.
 *
 * Built on `<details>`: it opens without JavaScript, is announced correctly by
 * screen readers, and is findable by the browser's own in-page search.
 */
const Faq = () => {
  return (
    <section id="faq" className="border-y border-border bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-content px-4">
        <Reveal>
          <SectionHeading
            eyebrow="שאלות נפוצות"
            title="שאלות ששווה לענות עליהן"
            subtitle="ואם נשארה שאלה — אפשר לפנות אלינו"
          />
        </Reveal>

        <Reveal className="mx-auto max-w-3xl space-y-3" stagger={0.05}>
          {FAQ.map((item) => (
            <details
              key={item.question}
              data-reveal-item
              className="group rounded-12 border border-border bg-canvas/60 px-5 transition-colors open:bg-surface"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-start">
                <span className="text-sm font-semibold text-ink md:text-base">
                  {item.question}
                </span>
                <IconChevronDown
                  className="h-4 w-4 shrink-0 text-ink-secondary transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-ink-secondary">{item.answer}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default Faq;
