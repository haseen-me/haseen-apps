import React, { CSSProperties, forwardRef, JSX } from 'react';

import { FONT_FAMILY_MONO, FONT_FAMILY_SANS } from '../../constants';
import { ThemeMode } from '../../theme/ThemeProvider';
import { getThemedColor } from '../../utils/colorUtils';

// ─── Types ──────────────────────────────────────────────────────────────────────

export enum TypographySize {
  CAPTION = 'caption',
  SMALL = 'small',
  BODY = 'body',
  MEDIUM = 'medium',
  LARGE = 'large',
  H4 = 'h4',
  H3 = 'h3',
  H2 = 'h2',
  H1 = 'h1',
}

export enum TypographyWeight {
  REGULAR = 400,
  MEDIUM = 500,
  SEMIBOLD = 600,
  BOLD = 700,
}

export enum TypographyOverflow {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
  ELLIPSIS = 'ellipsis',
  WRAP = 'wrap',
}

const SIZE_MAP: Record<TypographySize, { fontSize: string; lineHeight: string }> = {
  [TypographySize.CAPTION]: { fontSize: '0.6875rem', lineHeight: '1.25' },
  [TypographySize.SMALL]: { fontSize: '0.75rem', lineHeight: '1.33' },
  [TypographySize.BODY]: { fontSize: '0.8125rem', lineHeight: '1.38' },
  [TypographySize.MEDIUM]: { fontSize: '0.875rem', lineHeight: '1.43' },
  [TypographySize.LARGE]: { fontSize: '1rem', lineHeight: '1.5' },
  [TypographySize.H4]: { fontSize: '1.125rem', lineHeight: '1.44' },
  [TypographySize.H3]: { fontSize: '1.25rem', lineHeight: '1.4' },
  [TypographySize.H2]: { fontSize: '1.5rem', lineHeight: '1.33' },
  [TypographySize.H1]: { fontSize: '2rem', lineHeight: '1.25' },
};

// ─── Props ──────────────────────────────────────────────────────────────────────

export interface TypographyProps {
  children: React.ReactNode;
  size?: TypographySize;
  weight?: TypographyWeight;
  overflow?: TypographyOverflow;
  color?: string;
  mono?: boolean;
  uppercase?: boolean;
  align?: 'left' | 'center' | 'right';
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
  forceTheme?: ThemeMode;
  selectable?: boolean;
  maxLines?: number;
  id?: string;
  onClick?: (e: React.MouseEvent) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────────

const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      children,
      size = TypographySize.BODY,
      weight = TypographyWeight.REGULAR,
      overflow = TypographyOverflow.VISIBLE,
      color,
      mono = false,
      uppercase = false,
      align,
      as: Component = 'span',
      className,
      style,
      forceTheme,
      selectable = true,
      maxLines,
      id,
      onClick,
    },
    ref
  ) => {
    const sizeSpec = SIZE_MAP[size];

    const resolvedColor = color
      ? getThemedColor(color, forceTheme)
      : getThemedColor('var(--hsn-text-primary)', forceTheme);

    const overflowStyles: CSSProperties = {};
    if (overflow === TypographyOverflow.ELLIPSIS) {
      overflowStyles.overflow = 'hidden';
      overflowStyles.textOverflow = 'ellipsis';
      overflowStyles.whiteSpace = maxLines ? undefined : 'nowrap';
    } else if (overflow === TypographyOverflow.HIDDEN) {
      overflowStyles.overflow = 'hidden';
    }

    if (maxLines) {
      overflowStyles.display = '-webkit-box';
      overflowStyles.WebkitLineClamp = maxLines;
      overflowStyles.WebkitBoxOrient = 'vertical';
      overflowStyles.overflow = 'hidden';
    }

    const computedStyle: CSSProperties = {
      fontSize: sizeSpec.fontSize,
      lineHeight: sizeSpec.lineHeight,
      fontWeight: weight,
      fontFamily: mono ? FONT_FAMILY_MONO : FONT_FAMILY_SANS,
      color: resolvedColor,
      textTransform: uppercase ? 'uppercase' : undefined,
      textAlign: align,
      userSelect: selectable ? undefined : 'none',
      letterSpacing: uppercase ? '0.04em' : '-0.012em',
      margin: 0,
      padding: 0,
      ...overflowStyles,
      ...style,
    };

    return React.createElement(
      Component as string,
      {
        ref,
        id,
        className,
        style: computedStyle,
        onClick,
      },
      children
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;
