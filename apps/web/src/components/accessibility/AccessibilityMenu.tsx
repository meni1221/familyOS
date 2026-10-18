import { useState, useCallback, useEffect } from 'react';

// Custom SVG icons (no dependency on Tabler for accessibility menu)
const IconEyeOff = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.83M6.72 6.72a18.45 18.45 0 0 0-2.16 3.83" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconContrast = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8h4" />
    <path d="M4 16h4" />
    <path d="M16 12h4" />
    <path d="M4 12h4" />
  </svg>
);

const IconTextSize = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h4" />
    <path d="M4 16l2-2-2-2" />
    <path d="M20 12h-4" />
    <path d="M20 16l-2-2 2-2" />
    <path d="M8 4h8" />
    <path d="M12 12v8" />
  </svg>
);

const IconClose = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityMenu({ isOpen, onClose }: AccessibilityMenuProps) {
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState<'normal' | 'high' | 'dark' | 'monochrome'>('normal');
  const [animationsDisabled, setAnimationsDisabled] = useState(false);
  const [imagesHidden, setImagesHidden] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-contrast', contrast);
  }, [contrast]);

  useEffect(() => {
    if (animationsDisabled) {
      document.documentElement.style.setProperty('--animation', 'none');
      document.documentElement.style.setProperty('--transition', 'none');
    } else {
      document.documentElement.style.removeProperty('--animation');
      document.documentElement.style.removeProperty('--transition');
    }
  }, [animationsDisabled]);

  useEffect(() => {
    if (imagesHidden) {
      document.querySelectorAll('img').forEach((img) => {
        img.setAttribute('aria-hidden', 'true');
        img.style.opacity = '0';
      });
    } else {
      document.querySelectorAll('img').forEach((img) => {
        img.removeAttribute('aria-hidden');
        img.style.opacity = '';
      });
    }
  }, [imagesHidden]);

  const increaseFont = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 10, 200));
  }, []);

  const decreaseFont = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 10, 70));
  }, []);

  const toggleContrast = useCallback(() => {
    const modes: Array<'normal' | 'high' | 'dark' | 'monochrome'> = ['normal', 'high', 'dark', 'monochrome'];
    const currentIndex = modes.indexOf(contrast);
    const nextIndex = (currentIndex + 1) % modes.length;
    setContrast(modes[nextIndex]);
  }, [contrast]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-24 right-0 z-[1000] w-80 bg-surface border border-border rounded-12 shadow-modal p-4 transition-all duration-200"
      role="region"
      aria-label="תפריט נגישות"
      aria-labelledby="accessibility-menu-title"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 id="accessibility-menu-title" className="text-base font-semibold text-ink">
          תפריט נגישות
        </h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-4 flex items-center justify-center hover:bg-cream transition-colors"
          aria-label="סגור תפריט נגישות"
        >
          <IconClose className="h-5 w-5 text-ink-secondary" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-ink">גודל גופן</label>
            <span className="text-xs text-ink-secondary">{fontSize}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={decreaseFont}
              className="w-8 h-8 rounded-4 border border-border flex items-center justify-center hover:bg-cream transition-colors"
              aria-label="הקטן גודל גופן"
            >
              <IconTextSize className="h-4 w-4 text-ink-secondary" />
            </button>
            <button
              onClick={increaseFont}
              className="w-8 h-8 rounded-4 border border-border flex items-center justify-center hover:bg-cream transition-colors"
              aria-label="הגדל גודל גופן"
            >
              <IconTextSize className="h-4 w-4 text-ink-secondary" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-ink">ניגודיות צבעים</label>
          <button
            onClick={toggleContrast}
            className="w-full flex items-center justify-between px-3 py-2 rounded-4 border border-border bg-surface text-left hover:bg-cream transition-colors"
            aria-label="שנה מצב ניגודיות"
            aria-pressed={contrast !== 'normal'}
          >
            <span className="text-sm text-ink">
              {contrast === 'normal' ? 'רגיל' : contrast === 'high' ? 'גבוהה' : contrast === 'dark' ? 'כהה' : 'מונוכרומטי'}
            </span>
            <IconContrast className="h-4 w-4 text-ink-secondary" />
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-4 border border-border bg-surface hover:bg-cream transition-colors group">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 text-ink-secondary group-hover:text-forest">◆</span>
            <span className="text-sm text-ink">השבת אנימציות</span>
          </div>
          <button
            onClick={() => setAnimationsDisabled((prev) => !prev)}
            className="relative w-6 h-3 rounded-full bg-border transition-colors duration-200"
            aria-checked={animationsDisabled}
            role="switch"
            aria-label="השבת אנימציות"
          >
            <span
              className={`absolute w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${
                animationsDisabled ? 'translate-x-3' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-4 border border-border bg-surface hover:bg-cream transition-colors group">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 text-ink-secondary group-hover:text-forest">□</span>
            <span className="text-sm text-ink">הסתר תמונות</span>
          </div>
          <button
            onClick={() => setImagesHidden((prev) => !prev)}
            className="relative w-6 h-3 rounded-full bg-border transition-colors duration-200"
            aria-checked={imagesHidden}
            role="switch"
            aria-label="הסתר תמונות"
          >
            <span
              className={`absolute w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${
                imagesHidden ? 'translate-x-3' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between px-3 py-2 rounded-4 border border-border bg-surface hover:bg-cream transition-colors group">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 text-ink-secondary group-hover:text-forest">♪</span>
            <span className="text-sm text-ink">השתק קול</span>
          </div>
          <button
            onClick={() => setSoundMuted((prev) => !prev)}
            className="relative w-6 h-3 rounded-full bg-border transition-colors duration-200"
            aria-checked={soundMuted}
            role="switch"
            aria-label="השתק קול"
          >
            <span
              className={`absolute w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ${
                soundMuted ? 'translate-x-3' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div
          className="flex items-center justify-between px-3 py-2 rounded-4 border border-border bg-surface hover:bg-cream transition-colors group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setImagesHidden((prev) => !prev);
          }}
          onClick={() => setImagesHidden((prev) => !prev)}
          aria-label="מצב קורא מסך נקי"
        >
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 text-ink-secondary group-hover:text-forest">👁️</span>
            <span className="text-sm text-ink">מצב קורא מסך נקי</span>
          </div>
          <IconEyeOff className="h-4 w-4 text-ink-secondary group-hover:text-forest" />
        </div>

        <div className="border-t border-border my-3" />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-ink">רכזת נגישות:</p>
          <p className="text-sm text-ink">עו"ד שירן לוי אלדר</p>
          <p className="text-sm text-ink-secondary">טלפון: 054-2068580</p>
          <p className="text-sm text-ink-secondary">ימים א'-ה', בשעות פעילות המשרד</p>
        </div>
      </div>
    </div>
  );
}
