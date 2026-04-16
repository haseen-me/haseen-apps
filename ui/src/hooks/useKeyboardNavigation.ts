import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseKeyboardNavigationOptions {
  /** Total number of items in the list */
  itemCount: number;
  /** Callback when an item is selected (Enter) */
  onSelect?: (index: number) => void;
  /** Callback when escape is pressed */
  onEscape?: () => void;
  /** Whether the hook is active */
  enabled?: boolean;
}

/**
 * Arrow key navigation for lists/menus.
 * Returns the currently focused index and a reset function.
 */
export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onEscape,
  enabled = true,
}: UseKeyboardNavigationOptions) {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const usingMouse = useRef(false);

  const reset = useCallback(() => setFocusedIndex(-1), []);

  useEffect(() => {
    if (!enabled || itemCount === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      usingMouse.current = false;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev <= 0 ? itemCount - 1 : prev - 1));
          break;
        case 'Enter':
          if (focusedIndex >= 0) {
            e.preventDefault();
            onSelect?.(focusedIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
      }
    };

    const handleMouseMove = () => {
      usingMouse.current = true;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, itemCount, focusedIndex, onSelect, onEscape]);

  return { focusedIndex, setFocusedIndex, reset, usingMouse: usingMouse.current };
}
