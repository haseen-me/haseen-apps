import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { transitions } from '../../tokens';

export enum ChipSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

export const CHIP_END_ICON_DATA_TEST = 'hsn-chip-end-icon';

export interface ChipProps {
  label: string;
  size?: ChipSize;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: () => void;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

const Chip: React.FC<ChipProps> = ({
  label,
  size = ChipSize.MEDIUM,
  icon,
  endIcon,
  active = false,
  onClick,
  onDelete,
  className,
  style,
  dataTestId,
}) => {
  const isSmall = size === ChipSize.SMALL;

  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    height: isSmall ? '24px' : '28px',
    padding: isSmall ? '0 8px' : '0 10px',
    borderRadius: '9999px',
    fontSize: isSmall ? '0.6875rem' : '0.75rem',
    fontWeight: 500,
    fontFamily: FONT_FAMILY_SANS,
    color: active ? 'var(--hsn-accent-teal-primary)' : 'var(--hsn-text-secondary)',
    background: active ? 'var(--hsn-accent-teal-secondary)' : 'var(--hsn-cta-chip-default)',
    border: active ? 'none' : '1px solid var(--hsn-border-secondary)',
    cursor: onClick ? 'pointer' : 'default',
    transition: `all ${transitions.normal} ${transitions.easing}`,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...style,
  };

  const iconStyle: CSSProperties = {
    display: 'inline-flex',
    flexShrink: 0,
  };

  return (
    <div
      className={className}
      style={computedStyle}
      onClick={onClick}
      data-testid={dataTestId}
      role={onClick ? 'button' : undefined}
    >
      {icon && <span style={iconStyle}>{icon}</span>}
      <span>{label}</span>
      {(endIcon || onDelete) && (
        <span
          style={{ ...iconStyle, cursor: onDelete ? 'pointer' : undefined }}
          onClick={onDelete ? (e) => { e.stopPropagation(); onDelete(); } : undefined}
          data-testid={CHIP_END_ICON_DATA_TEST}
        >
          {endIcon ?? '✕'}
        </span>
      )}
    </div>
  );
};

Chip.displayName = 'Chip';

export default Chip;
