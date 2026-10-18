export type ContrastMode = 'normal' | 'high' | 'dark' | 'monochrome';

export interface AccessibilitySettings {
  /** Root font size, in percent. */
  fontSize: number;
  contrast: ContrastMode;
  animationsDisabled: boolean;
  imagesHidden: boolean;
  soundMuted: boolean;
}

export const FONT_SIZE_MIN = 70;
export const FONT_SIZE_MAX = 200;
export const FONT_SIZE_STEP = 10;

export const CONTRAST_MODES: ContrastMode[] = ['normal', 'high', 'dark', 'monochrome'];

export const CONTRAST_LABELS: Record<ContrastMode, string> = {
  normal: 'רגיל',
  high: 'גבוהה',
  dark: 'כהה',
  monochrome: 'מונוכרומטי',
};

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  fontSize: 100,
  contrast: 'normal',
  animationsDisabled: false,
  imagesHidden: false,
  soundMuted: false,
};

const STORAGE_KEY = 'familyos:accessibility-settings';

export function loadAccessibilitySettings(): AccessibilitySettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCESSIBILITY_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AccessibilitySettings>;
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable (private browsing); the preferences still apply
    // for the current session.
  }
}

/**
 * Applies the preferences to the document root. Every visual rule lives in CSS
 * and is driven by `data-*` attributes on `<html>`, so reverting a preference is
 * simply a matter of resetting the attribute.
 */
export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  const root = document.documentElement;

  root.style.fontSize = `${settings.fontSize}%`;
  root.setAttribute('data-contrast', settings.contrast);
  root.setAttribute('data-hide-images', String(settings.imagesHidden));
  root.setAttribute('data-reduce-motion', String(settings.animationsDisabled));
}
