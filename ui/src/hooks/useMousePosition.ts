import { useEffect, useState, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

/**
 * Tracks the mouse position, throttled to avoid excessive re-renders.
 */
export function useMousePosition(throttleMs = 200): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const lastUpdate = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate.current >= throttleMs) {
        lastUpdate.current = now;
        setPosition({ x: e.clientX, y: e.clientY });
      }
    };

    document.addEventListener('mousemove', handler);
    return () => document.removeEventListener('mousemove', handler);
  }, [throttleMs]);

  return position;
}
