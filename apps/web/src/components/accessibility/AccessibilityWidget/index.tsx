import { useCallback, useEffect, useRef, useState } from 'react';
import { IconAccessible, IconX } from '@tabler/icons-react';
import AccessibilityMenu from '../AccessibilityMenu';
import {
  AccessibilitySettings,
  applyAccessibilitySettings,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
} from '../settings';

/**
 * Floating accessibility control, mounted once for the whole app.
 *
 * It sits at the bottom of the *inline-end* side: bottom-left in Hebrew (RTL,
 * away from the sidebar) and bottom-right in English (LTR).
 */
const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() =>
    loadAccessibilitySettings()
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Applies stored preferences on first render, then keeps DOM + storage in sync.
  useEffect(() => {
    applyAccessibilitySettings(settings);
    saveAccessibilitySettings(settings);
  }, [settings]);

  const updateSettings = useCallback((patch: Partial<AccessibilitySettings>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  }, []);

  const closeMenu = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  // Escape closes the panel and returns focus to the trigger.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        closeMenu(true);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeMenu]);

  // Clicking outside closes the panel.
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [isOpen, closeMenu]);

  return (
    <div
      ref={containerRef}
      className="fixed end-6 bottom-20 z-[1000] lg:bottom-6 print:hidden"
    >
      {isOpen && (
        <AccessibilityMenu
          ref={panelRef}
          settings={settings}
          onChange={updateSettings}
          onClose={() => closeMenu(true)}
        />
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="תפריט נגישות"
        title="תפריט נגישות"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-white shadow-modal transition-all hover:scale-105 hover:bg-forest-deep"
      >
        {isOpen ? (
          <IconX className="h-5 w-5" />
        ) : (
          <IconAccessible className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};

export default AccessibilityWidget;
