import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';

export enum IconTextSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface IconTextProps {
  label: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: IconTextSize;
  color?: string;
  weight?: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: CSSProperties;
}

const FONT_SIZE_MAP: Record<IconTextSize, string> = {
  [IconTextSize.SMALL]: '0.6875rem',
  [IconTextSize.MEDIUM]: '0.75rem',
  [IconTextSize.LARGE]: '0.8125rem',
};

const IconText: React.FC<IconTextProps> = ({
  label,
  icon,
  endIcon,
  size = IconTextSize.MEDIUM,
  color,
  weight = 400,
  onClick,
  className,
  style,
}) => {
  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: FONT_SIZE_MAP[size],
    fontWeight: weight,
    fontFamily: FONT_FAMILY_SANS,
    color: color ?? 'var(--hsn-text-secondary)',
    cursor: onClick ? 'pointer' : undefined,
    userSelect: 'none',
    ...style,
  };

  return (
    <span className={className} style={computedStyle} onClick={onClick}>
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {label}
      {endIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{endIcon}</span>}
    </span>
  );
};

IconText.displayName = 'IconText';

export default IconText;
