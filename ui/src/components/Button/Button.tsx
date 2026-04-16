import React, { CSSProperties, forwardRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { radii, sizeHeight, transitions } from '../../tokens';
import { ThemeMode } from '../../theme/ThemeProvider';
import { getThemedColor } from '../../utils/colorUtils';
import { Size, Type } from '../../types';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: Type;
  size?: Size.SMALL | Size.MEDIUM | Size.LARGE;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  forceTheme?: ThemeMode;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

// ─── State machine for button appearance ────────────────────────────────────────
// Returns the CSS properties for each variant × interaction-state combination.
// Uses solid token values only — no translucent backgrounds.

type InteractionState = 'default' | 'hover' | 'active';

function getButtonTokens(
  btnType: Type,
  state: InteractionState,
  disabled: boolean,
  forceTheme?: ThemeMode
): { background: string; color: string; border: string; boxShadow: string } {
  const v = (cssVar: string) => getThemedColor(`var(${cssVar})`, forceTheme);

  if (disabled) {
    const disabledBg = btnType === Type.PRIMARY
      ? v('--hsn-cta-primary-disabled')
      : 'transparent';
    return {
      background: disabledBg,
      color: v('--hsn-text-disabled'),
      border: btnType === Type.SECONDARY ? `1px solid ${v('--hsn-border-secondary')}` : 'none',
      boxShadow: 'none',
    };
  }

  switch (btnType) {
    case Type.PRIMARY: {
      const bgMap: Record<InteractionState, string> = {
        default: v('--hsn-cta-primary-default'),
        hover: v('--hsn-cta-primary-hover'),
        active: v('--hsn-cta-primary-active'),
      };
      return {
        background: bgMap[state],
        color: v('--hsn-text-always-white'),
        border: 'none',
        boxShadow: state === 'hover'
          ? v('--hsn-primary-button-hover-shadow')
          : '0 1px 0 rgba(255,255,255,0.14) inset',
      };
    }

    case Type.SECONDARY: {
      const bgMap: Record<InteractionState, string> = {
        default: v('--hsn-cta-secondary-default'),
        hover: v('--hsn-cta-secondary-hover'),
        active: v('--hsn-cta-secondary-active'),
      };
      return {
        background: bgMap[state],
        color: v('--hsn-text-primary'),
        border: `1px solid ${v('--hsn-border-primary')}`,
        boxShadow: v('--hsn-shadow-secondary-button'),
      };
    }

    case Type.TERTIARY: {
      const bgMap: Record<InteractionState, string> = {
        default: v('--hsn-cta-tertiary-default'),
        hover: v('--hsn-cta-tertiary-hover'),
        active: v('--hsn-cta-tertiary-active'),
      };
      return {
        background: bgMap[state],
        color: v('--hsn-text-secondary'),
        border: 'none',
        boxShadow: 'none',
      };
    }

    case Type.DESTRUCTIVE: {
      const bgMap: Record<InteractionState, string> = {
        default: v('--hsn-cta-destructive-default'),
        hover: v('--hsn-cta-destructive-hover'),
        active: v('--hsn-cta-destructive-active'),
      };
      return {
        background: bgMap[state],
        color: v('--hsn-text-destructive'),
        border: `1px solid ${v('--hsn-border-destructive')}`,
        boxShadow: state === 'default' ? v('--hsn-shadow-destructive-button') : 'none',
      };
    }
  }
}

const FONT_SIZE_MAP: Record<string, string> = {
  [Size.SMALL]: '0.75rem',
  [Size.MEDIUM]: '0.8125rem',
  [Size.LARGE]: '0.875rem',
};

const PADDING_MAP: Record<string, string> = {
  [Size.SMALL]: '0 12px',
  [Size.MEDIUM]: '0 16px',
  [Size.LARGE]: '0 20px',
};

// ─── Component ──────────────────────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      onClick,
      type = Type.PRIMARY,
      size = Size.MEDIUM,
      fullWidth = false,
      disabled = false,
      loading = false,
      startIcon,
      endIcon,
      forceTheme,
      className,
      style,
      dataTestId,
    },
    ref
  ) => {
    const [interactionState, setInteractionState] = useState<InteractionState>('default');

    const isDisabled = disabled || loading;
    const effectiveState = isDisabled ? 'default' : interactionState;
    const tokens = getButtonTokens(type, effectiveState, isDisabled, forceTheme);
    const height = sizeHeight[size as keyof typeof sizeHeight] ?? sizeHeight.medium;

    const computedStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      height: `${height}px`,
      padding: PADDING_MAP[size] ?? '0 16px',
      fontSize: FONT_SIZE_MAP[size] ?? '0.8125rem',
      fontWeight: 600,
      fontFamily: FONT_FAMILY_SANS,
      lineHeight: '1',
      letterSpacing: '-0.01em',
      // Consistent radius — smaller than the default to feel enterprise/precise
      borderRadius: size === Size.SMALL ? radii.sm : radii.sm,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.55 : 1,
      transition: `background ${transitions.fast} ${transitions.easing}, box-shadow ${transitions.fast} ${transitions.easing}, border-color ${transitions.fast} ${transitions.easing}, transform ${transitions.fast} ${transitions.easing}`,
      transform: interactionState === 'active' && !isDisabled ? 'translateY(1px)' : 'none',
      width: fullWidth ? '100%' : undefined,
      background: tokens.background,
      color: tokens.color,
      border: tokens.border,
      boxShadow: tokens.boxShadow,
      // Focus is handled globally via :focus-visible in ThemeProvider CSS injection
      outline: 'none',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    return (
      <button
        ref={ref}
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        className={className}
        style={computedStyle}
        data-testid={dataTestId}
        aria-disabled={isDisabled}
        onMouseEnter={() => !isDisabled && setInteractionState('hover')}
        onMouseLeave={() => setInteractionState('default')}
        onMouseDown={() => !isDisabled && setInteractionState('active')}
        onMouseUp={() => !isDisabled && setInteractionState('hover')}
      >
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: '12px',
              height: '12px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.6s linear infinite',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        )}
        {!loading && startIcon && (
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{startIcon}</span>
        )}
        <span>{children}</span>
        {endIcon && (
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{endIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
