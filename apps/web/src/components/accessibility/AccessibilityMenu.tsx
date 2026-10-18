import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import {
  IconContrast,
  IconPhotoOff,
  IconPlayerPause,
  IconTextDecrease,
  IconTextIncrease,
  IconVolumeOff,
  IconX,
} from '@tabler/icons-react';
import {
  AccessibilitySettings,
  CONTRAST_LABELS,
  CONTRAST_MODES,
  FONT_SIZE_MAX,
  FONT_SIZE_MIN,
  FONT_SIZE_STEP,
} from './settings';
import SwitchRow from '../ui/Switch';

interface AccessibilityMenuProps {
  settings: AccessibilitySettings;
  onChange: (patch: Partial<AccessibilitySettings>) => void;
  onClose: () => void;
}

/**
 * The accessibility preferences panel. Purely presentational: state is owned by
 * `AccessibilityWidget`, which also decides where the panel is anchored.
 */
const AccessibilityMenu = forwardRef<HTMLDivElement, AccessibilityMenuProps>(
  function AccessibilityMenu({ settings, onChange, onClose }, ref) {
    const contrastIndex = CONTRAST_MODES.indexOf(settings.contrast);

    const cycleContrast = () => {
      const next = CONTRAST_MODES[(contrastIndex + 1) % CONTRAST_MODES.length];
      onChange({ contrast: next });
    };

    const changeFontSize = (delta: number) => {
      const next = Math.min(
        Math.max(settings.fontSize + delta, FONT_SIZE_MIN),
        FONT_SIZE_MAX
      );
      onChange({ fontSize: next });
    };

    return (
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby="accessibility-menu-title"
        className="absolute bottom-full end-0 mb-3 flex max-h-[calc(100vh-7rem)] w-80 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-12 border border-border bg-surface shadow-modal"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="accessibility-menu-title" className="text-base font-semibold text-ink">
            תפריט נגישות
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-4 text-ink-secondary transition-colors hover:bg-cream hover:text-ink"
            aria-label="סגור תפריט נגישות"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4">
          {/* Font size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">גודל גופן</span>
              <span className="text-xs text-ink-secondary" aria-live="polite">
                {settings.fontSize}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeFontSize(-FONT_SIZE_STEP)}
                disabled={settings.fontSize <= FONT_SIZE_MIN}
                className="flex h-8 w-8 items-center justify-center rounded-4 border border-border text-ink-secondary transition-colors hover:bg-cream hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="הקטן גודל גופן"
              >
                <IconTextDecrease className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeFontSize(FONT_SIZE_STEP)}
                disabled={settings.fontSize >= FONT_SIZE_MAX}
                className="flex h-8 w-8 items-center justify-center rounded-4 border border-border text-ink-secondary transition-colors hover:bg-cream hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="הגדל גודל גופן"
              >
                <IconTextIncrease className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ fontSize: 100 })}
                className="ms-auto rounded-4 px-2 py-1 text-xs text-forest transition-colors hover:bg-cream"
              >
                איפוס
              </button>
            </div>
          </div>

          {/* Contrast */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-ink">ניגודיות צבעים</span>
            <button
              type="button"
              onClick={cycleContrast}
              aria-pressed={settings.contrast !== 'normal'}
              aria-label={`שנה מצב ניגודיות. מצב נוכחי: ${CONTRAST_LABELS[settings.contrast]}`}
              className="flex w-full items-center justify-between rounded-4 border border-border px-3 py-2 text-start transition-colors hover:bg-cream"
            >
              <span className="text-sm text-ink">{CONTRAST_LABELS[settings.contrast]}</span>
              <IconContrast className="h-4 w-4 text-ink-secondary" />
            </button>
          </div>

          <SwitchRow
            icon={<IconPlayerPause className="h-4 w-4" />}
            label="השבת אנימציות"
            checked={settings.animationsDisabled}
            onChange={(next) => onChange({ animationsDisabled: next })}
          />

          <SwitchRow
            icon={<IconPhotoOff className="h-4 w-4" />}
            label="הסתר תמונות"
            checked={settings.imagesHidden}
            onChange={(next) => onChange({ imagesHidden: next })}
          />

          <SwitchRow
            icon={<IconVolumeOff className="h-4 w-4" />}
            label="השתק קול"
            checked={settings.soundMuted}
            onChange={(next) => onChange({ soundMuted: next })}
          />
        </div>

        <div className="border-t border-border px-4 py-3">
          <Link
            to="/accessibility"
            onClick={onClose}
            className="text-xs font-medium text-forest hover:underline"
          >
            להצהרת הנגישות המלאה
          </Link>
        </div>
      </div>
    );
  }
);

export default AccessibilityMenu;
