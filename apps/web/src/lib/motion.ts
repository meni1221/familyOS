import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Whether motion should be skipped.
 *
 * Two switches count: the operating system's reduced-motion preference and the
 * app's own accessibility toggle, which is stored on `<html>`. Animation is a
 * preference, not a default — a page that ignores both is a page that makes
 * some people dizzy.
 */
export const isMotionReduced = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.getAttribute('data-reduce-motion') === 'true';

export { gsap, ScrollTrigger };
