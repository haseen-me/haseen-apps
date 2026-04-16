import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { Size } from '../../types';
import { getLabelColor } from '../../utils/colorUtils';

const SIZE_MAP: Record<string, number> = {
  [Size.X_SMALL]: 20,
  [Size.SMALL]: 24,
  [Size.MEDIUM]: 32,
  [Size.LARGE]: 40,
  [Size.X_LARGE]: 48,
};

const FONT_SIZE_MAP: Record<string, string> = {
  [Size.X_SMALL]: '0.5rem',
  [Size.SMALL]: '0.625rem',
  [Size.MEDIUM]: '0.75rem',
  [Size.LARGE]: '0.875rem',
  [Size.X_LARGE]: '1rem',
};

export interface AvatarProps {
  label?: string;
  imageSrc?: string;
  icon?: React.ReactNode;
  size?: Size;
  color?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  dataTestId?: string;
}

export function getAvatarIconOrLabel(label?: string): { letter: string; color: string } {
  const letter = label ? label.charAt(0).toUpperCase() : '?';
  const color = label ? getLabelColor(label) : 'teal';
  return { letter, color };
}

const Avatar: React.FC<AvatarProps> = ({
  label,
  imageSrc,
  icon,
  size = Size.MEDIUM,
  color,
  className,
  style,
  onClick,
  dataTestId,
}) => {
  const dim = SIZE_MAP[size] ?? 32;
  const fontSize = FONT_SIZE_MAP[size] ?? '0.75rem';
  const { letter, color: labelColor } = getAvatarIconOrLabel(label);
  const bgColor = color ?? `var(--hsn-accent-${labelColor}-secondary)`;
  const textColor = color ? 'var(--hsn-text-always-white)' : `var(--hsn-accent-${labelColor}-primary)`;

  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${dim}px`,
    height: `${dim}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    fontSize,
    fontWeight: 600,
    fontFamily: FONT_FAMILY_SANS,
    background: imageSrc ? 'transparent' : bgColor,
    color: textColor,
    cursor: onClick ? 'pointer' : undefined,
    userSelect: 'none',
    ...style,
  };

  return (
    <div
      className={className}
      style={computedStyle}
      onClick={onClick}
      data-testid={dataTestId}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={label ?? 'avatar'}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : icon ? (
        icon
      ) : (
        letter
      )}
    </div>
  );
};

Avatar.displayName = 'Avatar';

export default Avatar;
