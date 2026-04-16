import React, { CSSProperties } from 'react';

import { FONT_FAMILY_MONO } from '../../constants';

export interface MonoTagProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
  style?: CSSProperties;
}

const MonoTag: React.FC<MonoTagProps> = ({
  children,
  color,
  bgColor,
  className,
  style,
}) => {
  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.6875rem',
    fontWeight: 500,
    fontFamily: FONT_FAMILY_MONO,
    color: color ?? 'var(--hsn-accent-teal-primary)',
    background: bgColor ?? 'var(--hsn-accent-teal-secondary)',
    whiteSpace: 'nowrap',
    lineHeight: '1.4',
    ...style,
  };

  return (
    <span className={className} style={computedStyle}>
      {children}
    </span>
  );
};

MonoTag.displayName = 'MonoTag';

export default MonoTag;
