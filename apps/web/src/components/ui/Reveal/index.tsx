import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, isMotionReduced, ScrollTrigger } from '../../../lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Extra delay before the motion starts, in seconds. */
  delay?: number;
  /**
   * When set, the element's `[data-reveal-item]` children are revealed one
   * after another with this gap, instead of the wrapper itself.
   */
  stagger?: number;
}

/**
 * Fades a section in as it enters the viewport.
 *
 * The animation starts from the rendered state, so with JavaScript disabled or
 * motion reduced the content is simply visible. Scroll triggers fire once: a
 * section that re-animates every time it passes is a section that gets in the
 * way of reading.
 */
const Reveal = ({ children, className, delay = 0, stagger = 0 }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element || isMotionReduced()) return;

      const items = element.querySelectorAll<HTMLElement>('[data-reveal-item]');
      const targets = stagger > 0 ? items : element;
      if (stagger > 0 && items.length === 0) return;

      gsap.from(targets, {
        opacity: 0,
        y: 18,
        duration: 0.5,
        delay,
        stagger,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      });

      // Web fonts change the height of the text these triggers were measured
      // against, which would leave a section waiting for a viewport it already
      // passed.
      void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default Reveal;
