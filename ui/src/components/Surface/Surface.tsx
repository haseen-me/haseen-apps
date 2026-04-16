import React, { CSSProperties, forwardRef } from 'react';

import { radii, zIndex } from '../../tokens';

// ─── Class Constants ────────────────────────────────────────────────────────────

export const SURFACE_CLASSNAME = 'hsn-surface';
export const MODAL_CLASSNAME = 'hsn-modal';
export const DRAWER_CLASSNAME = 'hsn-drawer';
export const DROPDOWN_CALLER_CLASSNAME = 'hsn-dropdown-caller';
export const SCRIM_CLASSNAME = 'hsn-scrim';
export const ENABLE_OUTSIDE_CLICKS_CLASSNAME = 'hsn-enable-outside-clicks';
export const MODAL_AND_DROPDOWN_SELECTOR = `.${MODAL_CLASSNAME}, .${DROPDOWN_CALLER_CLASSNAME}`;

// ─── Types ──────────────────────────────────────────────────────────────────────

export type SurfaceLevel = 'l0' | 'l1' | 'l2' | 'l3';

// 'glass' variant is kept for API compatibility but maps to the solid token —
// there is no glassmorphism in the Privacy-First Enterprise theme.
export type SurfaceVariant = 'solid' | 'glass';

export interface SurfaceProps {
  children: React.ReactNode;
  level?: SurfaceLevel;
  variant?: SurfaceVariant;
  rounded?: boolean;
  shadow?: boolean;
  padding?: string | number;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  id?: string;
}

// ─── Shadow map — only for floating overlays ─────────────────────────────────────
// Structural panes use borders for separation; shadows are reserved for
// elements that float above the document (dropdowns, dialogs, tooltips).

const SHADOW_MAP: Record<string, string> = {
  l0: 'none',
  l1: 'var(--hsn-shadow-l1)',
  l2: 'var(--hsn-shadow-l2)',
  l3: 'var(--hsn-shadow-l3)',
};

// ─── Component ──────────────────────────────────────────────────────────────────

const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      children,
      level = 'l2',
      variant: _variant = 'solid',
      rounded = true,
      shadow = true,
      padding,
      className,
      style,
      onClick,
      id,
    },
    ref
  ) => {
    // Both 'solid' and 'glass' resolve to the solid token.
    // The --hsn-bg-*-glass vars are aliased to solid values in theme.ts,
    // so no backdropFilter is ever applied.
    const bgVar = `var(--hsn-bg-${level}-solid)`;
    const shadowValue = shadow ? SHADOW_MAP[level] : 'none';

    const computedStyle: CSSProperties = {
      background: bgVar,
      borderRadius: rounded ? radii.lg : undefined,
      border: '1px solid var(--hsn-border-primary)',
      // backdropFilter intentionally omitted — zero glassmorphism
      boxShadow: shadowValue !== 'none' ? shadowValue : undefined,
      padding: typeof padding === 'number' ? `${padding}px` : padding,
      position: 'relative',
      overflow: 'hidden',
      zIndex: zIndex.base,
      ...style,
    };

    return (
      <div
        ref={ref}
        id={id}
        className={`${SURFACE_CLASSNAME}${className ? ` ${className}` : ''}`}
        style={computedStyle}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = 'Surface';

export default Surface;
