import { useEffect } from 'react';

/**
 * Calls a handler when the Escape key is pressed.
 * Optionally scoped to the topmost element matching a selector.
 */
export function useOnEscapePress(
  handler: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handler();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handler, enabled]);
}
