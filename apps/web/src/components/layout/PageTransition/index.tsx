import { useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { gsap, isMotionReduced } from '../../../lib/motion';

/**
 * A short entrance for every route.
 *
 * It is deliberately only an entrance: animating the old page out would delay
 * the new one, and the point of a transition in an app is to say "this is a new
 * screen", not to make the person wait for it.
 */
const PageTransition = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      if (!ref.current || isMotionReduced()) return;

      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out',
          // Leave no inline transform behind: it would become the containing
          // block for anything fixed inside the page.
          clearProps: 'transform',
        }
      );
    },
    { dependencies: [pathname], scope: ref }
  );

  return <div ref={ref}>{children}</div>;
};

export default PageTransition;
