import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { IconBell, IconCalendarEvent, IconCheck, IconWallet } from '@tabler/icons-react';
import { gsap, isMotionReduced } from '../../../lib/motion';

const TASKS = [
  { label: 'לקחת את נועה לגן', done: true, meta: '08:00' },
  { label: 'לקנות מצרכים לשבת', done: false, meta: 'היום' },
  { label: 'תור לרופאת ילדים', done: false, meta: '17:30' },
];

/**
 * A drawn preview of the product, not a screenshot.
 *
 * It is built from the same colours and shapes as the app, so it stays sharp at
 * every size and adds no image weight to the page. The whole panel is
 * decorative: the claims it illustrates are in the text beside it, and a screen
 * reader should not read a fake task list.
 */
const HeroPreview = () => {
  const badgeRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isMotionReduced() || !badgeRef.current) return;

    gsap.to(badgeRef.current, {
      y: -6,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  });

  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="absolute -inset-6 -z-10 rounded-16 bg-sage-light/70 blur-2xl" />

      <div className="rounded-16 border border-border bg-surface p-4 shadow-modal sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-caption text-ink-secondary">השבוע אצלכם</p>
            <p className="text-sm font-semibold text-ink">משפחת לוי</p>
          </div>
          <span className="badge-neutral">3 משימות</span>
        </div>

        <ul className="space-y-2">
          {TASKS.map((task) => (
            <li
              key={task.label}
              className="flex items-center gap-3 rounded-4 border border-border/70 bg-canvas/60 px-3 py-2"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  task.done ? 'border-forest bg-forest text-white' : 'border-sand bg-surface'
                }`}
              >
                {task.done && <IconCheck className="h-3 w-3" />}
              </span>
              <span
                className={`flex-1 text-xs ${task.done ? 'text-ink-secondary line-through' : 'text-ink'}`}
              >
                {task.label}
              </span>
              <span className="text-caption text-ink-secondary">{task.meta}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-4 bg-sand-light p-3">
            <div className="mb-2 flex items-center gap-2 text-caption font-medium text-ink-secondary">
              <IconWallet className="h-3.5 w-3.5" />
              תקציב החודש
            </div>
            <p className="text-numeric text-sm font-semibold text-ink">62% נוצלו</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand">
              <div className="h-full w-[62%] rounded-full bg-gold" />
            </div>
          </div>

          <div className="rounded-4 bg-sage-light p-3">
            <div className="mb-2 flex items-center gap-2 text-caption font-medium text-ink-secondary">
              <IconCalendarEvent className="h-3.5 w-3.5" />
              הבא בתור
            </div>
            <p className="text-sm font-semibold text-ink">ארוחת ערב</p>
            <p className="text-caption text-ink-secondary">היום · 19:00</p>
          </div>
        </div>
      </div>

      <div
        ref={badgeRef}
        className="absolute -bottom-5 start-4 flex items-center gap-2 rounded-12 border border-border bg-surface px-3 py-2 shadow-card"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-light">
          <IconBell className="h-4 w-4 text-gold" />
        </span>
        <span className="text-caption font-medium text-ink">תזכורת לפני פגישה</span>
      </div>
    </div>
  );
};

export default HeroPreview;
