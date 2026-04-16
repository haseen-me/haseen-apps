import React, { CSSProperties, useEffect, useRef, useCallback } from 'react';

import { zIndex, transitions } from '../../tokens';

export const DROPDOWN_CALLER_ID = 'hsn-dropdown-caller';

export interface DropdownProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  anchor?: React.RefObject<HTMLElement | null>;
  width?: number | string;
  maxHeight?: number | string;
  portal?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ─── Component ──────────────────────────────────────────────────────────────────

const Dropdown: React.FC<DropdownProps> = ({
  children,
  open,
  onClose,
  anchor,
  width,
  maxHeight = 320,
  className,
  style,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Close on outside click or Escape ──────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        (!anchor?.current || !anchor.current.contains(e.target as Node))
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        // Return focus to the anchor element after closing
        anchor?.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape, true);
    };
  }, [open, onClose, anchor]);

  // ── Arrow key navigation within the dropdown ──────────────────────────────────
  // Collects all focusable menu items and cycles through them with ArrowUp/Down.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dropdownRef.current) return;

    const focusableSelectors = '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])';
    const items = Array.from(
      dropdownRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );

    if (items.length === 0) return;

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      items[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      items[prev].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === 'Tab') {
      // Trap Tab within the dropdown; Shift+Tab wraps backwards
      e.preventDefault();
      if (e.shiftKey) {
        const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        items[prev].focus();
      } else {
        const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        items[next].focus();
      }
    }
  }, []);

  // Focus first item when dropdown opens
  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const firstItem = dropdownRef.current.querySelector<HTMLElement>(
      '[role="menuitem"]:not([disabled]):not([aria-disabled="true"])'
    );
    // Small delay to let the DOM settle after the animation frame
    const id = requestAnimationFrame(() => firstItem?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  const computedStyle: CSSProperties = {
    position: 'absolute',
    zIndex: zIndex.dropdown,
    // Solid background — no translucency, no backdrop-filter
    background: 'var(--hsn-bg-l2-solid)',
    border: '1px solid var(--hsn-border-primary)',
    borderRadius: '6px',
    boxShadow: 'var(--hsn-shadow-dropdown)',
    padding: '4px',
    width: typeof width === 'number' ? `${width}px` : width,
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    overflowY: 'auto',
    overflowX: 'hidden',
    animation: `hsnDropdownIn ${transitions.normal} ${transitions.easing}`,
    outline: 'none',
    ...style,
  };

  return (
    <div
      ref={dropdownRef}
      className={className}
      style={computedStyle}
      role="menu"
      aria-orientation="vertical"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

export default Dropdown;
