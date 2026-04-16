import React, { CSSProperties, useEffect, useRef } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { zIndex, transitions } from '../../tokens';

export enum DialogType {
  DEFAULT = 'default',
  CONFIRM = 'confirm',
  DESTRUCTIVE = 'destructive',
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  type?: DialogType;
  width?: number | string;
  actions?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

// ─── Focus trap helpers ─────────────────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (el) => !el.closest('[aria-disabled="true"]')
  );
}

// ─── Component ──────────────────────────────────────────────────────────────────

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  type: _type = DialogType.DEFAULT,
  width = 440,
  actions,
  className,
  style,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Remember what was focused before opening so we can restore it on close
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Focus the dialog container (or first focusable child) after mount
    const id = requestAnimationFrame(() => {
      if (!dialogRef.current) return;
      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        dialogRef.current.focus();
      }
    });

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    // Focus trap: cycle Tab within the dialog
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    document.addEventListener('keydown', handleTab, true);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', handleEscape, true);
      document.removeEventListener('keydown', handleTab, true);
      // Restore focus when dialog closes
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const scrimStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: zIndex.modal,
    background: 'var(--hsn-bg-scrim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `hsnFadeIn ${transitions.normal} ${transitions.easing}`,
  };

  const dialogStyle: CSSProperties = {
    // Solid surface — no translucency, no backdrop-filter
    background: 'var(--hsn-bg-l2-solid)',
    border: '1px solid var(--hsn-border-primary)',
    borderRadius: '8px',
    boxShadow: 'var(--hsn-shadow-dialog)',
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: 'calc(100vw - 48px)',
    maxHeight: 'calc(100vh - 64px)',
    overflow: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    animation: `hsnSlideUp ${transitions.normal} ${transitions.easing}`,
    outline: 'none',
    ...style,
  };

  const titleStyle: CSSProperties = {
    fontSize: '0.9375rem',
    fontWeight: 600,
    fontFamily: FONT_FAMILY_SANS,
    color: 'var(--hsn-text-primary)',
    margin: 0,
    lineHeight: '1.4',
    letterSpacing: '-0.01em',
  };

  const descStyle: CSSProperties = {
    fontSize: '0.8125rem',
    fontWeight: 400,
    fontFamily: FONT_FAMILY_SANS,
    color: 'var(--hsn-text-secondary)',
    margin: 0,
    lineHeight: '1.6',
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--hsn-border-primary)',
  };

  return (
    <div
      style={scrimStyle}
      onClick={onClose}
      role="presentation"
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        className={className}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'hsn-dialog-title' : undefined}
        aria-describedby={description ? 'hsn-dialog-desc' : undefined}
        tabIndex={-1}
      >
        {title && (
          <h2 id="hsn-dialog-title" style={titleStyle}>
            {title}
          </h2>
        )}
        {description && (
          <p id="hsn-dialog-desc" style={descStyle}>
            {description}
          </p>
        )}
        {children}
        {actions && <div style={actionsStyle}>{actions}</div>}
      </div>
    </div>
  );
};

Dialog.displayName = 'Dialog';

export { DialogType as DialogTypes };
export default Dialog;
