import React, { CSSProperties, forwardRef, useState } from 'react';

import { sizeHeight, transitions } from '../../tokens';
import { ThemeMode } from '../../theme/ThemeProvider';
import { getThemedColor } from '../../utils/colorUtils';
import { Size, Type } from '../../types';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: Type;
  size?: Size.SMALL | Size.MEDIUM | Size.LARGE;
  disabled?: boolean;
  tooltip?: string;
  forceTheme?: ThemeMode;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

type InteractionState = 'default' | 'hover' | 'active';

// ─── Component ──────────────────────────────────────────────────────────────────

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      onClick,
      type = Type.TERTIARY,
      size = Size.MEDIUM,
      disabled = false,
      tooltip,
      forceTheme,
      className,
      style,
      dataTestId,
    },
    ref
  ) => {
    const [interactionState, setInteractionState] = useState<InteractionState>('default');

    const dim = sizeHeight[size as keyof typeof sizeHeight] ?? sizeHeight.medium;
    const v = (cssVar: string) => getThemedColor(`var(${cssVar})`, forceTheme);

    const effectiveState = disabled ? 'default' : interactionState;

    // Background maps: solid surfaces for each button type and state
    const bgMap: Record<Type, Record<InteractionState, string>> = {
      [Type.PRIMARY]: {
        default: v('--hsn-cta-primary-default'),
        hover: v('--hsn-cta-primary-hover'),
        active: v('--hsn-cta-primary-active'),
      },
      [Type.SECONDARY]: {
        default: v('--hsn-cta-secondary-default'),
        hover: v('--hsn-cta-secondary-hover'),
        active: v('--hsn-cta-secondary-active'),
      },
      [Type.TERTIARY]: {
        default: v('--hsn-cta-tertiary-default'),
        hover: v('--hsn-cta-tertiary-hover'),
        active: v('--hsn-cta-tertiary-active'),
      },
      [Type.DESTRUCTIVE]: {
        default: v('--hsn-cta-destructive-default'),
        hover: v('--hsn-cta-destructive-hover'),
        active: v('--hsn-cta-destructive-active'),
      },
    };

    const colorMap: Record<Type, string> = {
      [Type.PRIMARY]: v('--hsn-text-always-white'),
      [Type.SECONDARY]: v('--hsn-icon-primary'),
      [Type.TERTIARY]: v('--hsn-icon-secondary'),
      [Type.DESTRUCTIVE]: v('--hsn-icon-destructive'),
    };

    const computedStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${dim}px`,
      height: `${dim}px`,
      borderRadius: '6px',
      background: disabled ? 'transparent' : bgMap[type][effectiveState],
      color: disabled ? v('--hsn-icon-disabled') : colorMap[type],
      border: type === Type.SECONDARY
        ? `1px solid ${v('--hsn-border-primary')}`
        : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transform: interactionState === 'active' && !disabled ? 'translateY(1px)' : 'none',
      transition: `background ${transitions.fast} ${transitions.easing}, transform ${transitions.fast} ${transitions.easing}`,
      outline: 'none',
      padding: 0,
      flexShrink: 0,
      ...style,
    };

    return (
      <button
        ref={ref}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={className}
        style={computedStyle}
        data-testid={dataTestId}
        title={tooltip}
        aria-label={tooltip}
        aria-disabled={disabled}
        onMouseEnter={() => !disabled && setInteractionState('hover')}
        onMouseLeave={() => setInteractionState('default')}
        onMouseDown={() => !disabled && setInteractionState('active')}
        onMouseUp={() => !disabled && setInteractionState('hover')}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
