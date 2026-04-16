import React, { CSSProperties } from 'react';

import { transitions } from '../../tokens';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'medium',
  className,
  style,
  dataTestId,
}) => {
  const isSmall = size === 'small';
  const trackW = isSmall ? 32 : 40;
  const trackH = isSmall ? 18 : 22;
  const thumbD = isSmall ? 14 : 18;
  const offset = 2;

  const trackStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    width: `${trackW}px`,
    height: `${trackH}px`,
    borderRadius: `${trackH}px`,
    padding: `${offset}px`,
    background: checked ? 'var(--hsn-cta-primary-default)' : 'var(--hsn-bg-field-default)',
    border: checked ? 'none' : '1px solid var(--hsn-border-secondary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `background ${transitions.normal} ${transitions.easing}`,
    flexShrink: 0,
    ...style,
  };

  const thumbStyle: CSSProperties = {
    width: `${thumbD}px`,
    height: `${thumbD}px`,
    borderRadius: '50%',
    background: checked ? 'var(--hsn-text-always-white)' : 'var(--hsn-icon-secondary)',
    transform: checked ? `translateX(${trackW - thumbD - offset * 2 - (checked ? 0 : 2)}px)` : 'translateX(0)',
    transition: `transform ${transitions.normal} ${transitions.easing}`,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  };

  return (
    <button
      className={className}
      style={trackStyle}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <div style={thumbStyle} />
    </button>
  );
};

Toggle.displayName = 'Toggle';

export default Toggle;
