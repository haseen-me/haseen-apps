import { useEffect, useRef } from 'react';

import { MODAL_AND_DROPDOWN_SELECTOR } from '../components/Surface';

export interface UseOnClickOutsideOptions {
  onClickOutside: (e: MouseEvent | TouchEvent) => void;
  enabled?: boolean;
  excludeRefs?: React.RefObject<HTMLElement | null>[];
  excludeClassNames?: string[];
}

/**
 * Detects clicks outside a target element, with support for
 * excluding specific refs and class names (e.g., modals, dropdowns).
 */
export function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  options: UseOnClickOutsideOptions
) {
  const { onClickOutside, enabled = true, excludeRefs = [], excludeClassNames = [] } = options;
  const callbackRef = useRef(onClickOutside);
  callbackRef.current = onClickOutside;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;

      // Ignore if clicking inside the ref
      if (ref.current?.contains(target)) return;

      // Ignore if clicking inside excluded refs
      for (const excRef of excludeRefs) {
        if (excRef.current?.contains(target)) return;
      }

      // Ignore if target is inside an excluded class name
      if (target instanceof HTMLElement) {
        for (const className of excludeClassNames) {
          if (target.closest(`.${className}`)) return;
        }
        // Ignore clicks inside modals/dropdowns by default
        if (target.closest(MODAL_AND_DROPDOWN_SELECTOR)) return;
      }

      callbackRef.current(e);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, enabled, excludeRefs, excludeClassNames]);
}
