import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import { IconCookie } from '@tabler/icons-react';
import { gsap, isMotionReduced } from '../../../lib/motion';
import {
  COOKIE_NOTICE_DELAY_MS,
  hasSeenCookieNotice,
  rememberCookieNotice,
} from '../../../lib/cookieNotice';

/**
 * A notice, not a consent wall.
 *
 * The site sets exactly one cookie — the HttpOnly session cookie that keeps a
 * signed-in person signed in. Strictly necessary cookies are exempt from the
 * consent requirement, so asking for permission would suggest a choice that
 * does not exist. What is required is to say what is stored and why, which is
 * what this does, once, with the privacy policy one click away.
 */
const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasSeenCookieNotice()) return;

    const timer = window.setTimeout(() => setIsVisible(true), COOKIE_NOTICE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      if (!isVisible || !cardRef.current || isMotionReduced()) return;

      gsap.from(cardRef.current, { opacity: 0, y: 14, duration: 0.35, ease: 'power2.out' });
    },
    { dependencies: [isVisible] }
  );

  const dismiss = () => {
    rememberCookieNotice();

    const element = cardRef.current;
    if (!element || isMotionReduced()) {
      setIsVisible(false);
      return;
    }

    gsap.to(element, {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power1.in',
      onComplete: () => setIsVisible(false),
    });
  };

  if (!isVisible) return null;

  return (
    <div
      ref={cardRef}
      role="region"
      aria-label="שימוש בעוגיות"
      className="fixed inset-x-4 bottom-40 z-[950] mx-auto max-w-md rounded-12 border border-border bg-surface p-4 shadow-modal md:bottom-6 print:hidden"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-light"
          aria-hidden="true"
        >
          <IconCookie className="h-5 w-5 text-forest" />
        </span>

        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">עוגייה אחת, והיא הכרחית</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
            שלנו שומרת עוגיית התחברות חיונית בלבד, כדי להשאיר אתכם מחוברים. אין עוגיות פרסום או
            מעקב. פרטים ב
            <Link
              to="/privacy"
              className="text-forest underline underline-offset-2 hover:text-forest-deep"
            >
              מדיניות הפרטיות
            </Link>
            .
          </p>
          <button type="button" onClick={dismiss} className="btn-primary btn-sm mt-3">
            הבנתי
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
