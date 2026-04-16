import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { transitions } from '../../tokens';

export enum DropdownItemColor {
  DEFAULT = 'default',
  DESTRUCTIVE = 'destructive',
}

export interface DropdownItemProps {
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  icon?: React.ReactNode;
  endElement?: React.ReactNode;
  color?: DropdownItemColor;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  label,
  onClick,
  icon,
  endElement,
  color = DropdownItemColor.DEFAULT,
  active = false,
  disabled = false,
  className,
  style,
  dataTestId,
}) => {
  const isDestructive = color === DropdownItemColor.DESTRUCTIVE;

  const computedStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontFamily: FONT_FAMILY_SANS,
    fontWeight: 400,
    color: isDestructive ? 'var(--hsn-text-destructive)' : 'var(--hsn-text-primary)',
    background: active ? 'var(--hsn-bg-cell-active)' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `background ${transitions.fast} ${transitions.easing}`,
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    userSelect: 'none',
    lineHeight: '1.38',
    ...style,
  };

  const iconStyle: CSSProperties = {
    display: 'inline-flex',
    flexShrink: 0,
    color: isDestructive ? 'var(--hsn-icon-destructive)' : 'var(--hsn-icon-secondary)',
  };

  return (
    <button
      className={className}
      style={computedStyle}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      role="menuitem"
      data-testid={dataTestId}
    >
      {icon && <span style={iconStyle}>{icon}</span>}
      <span style={{ flex: 1 }}>{label}</span>
      {endElement && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{endElement}</span>}
    </button>
  );
};

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;
