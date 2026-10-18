import { useEffect } from 'react';

/**
 * Elements that keep their normal clipboard behaviour: the form controls the
 * app is unusable without, plus anything explicitly marked as copyable.
 */
const EDITABLE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [data-copyable]';

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(EDITABLE_SELECTOR) !== null;
}

/**
 * Keeps the site's own content out of the clipboard.
 *
 * The matching CSS in `index.css` stops the text from being selected at all;
 * these listeners cover the rest — the clipboard events themselves, the
 * right-click menu and dragging an image out of the page. Everything that
 * accepts input stays untouched, so typing, pasting into a form and copying
 * back out of one all keep working.
 */
export default function ContentGuard() {
  useEffect(() => {
    const block = (event: Event) => {
      if (isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);

    return () => {
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return null;
}
