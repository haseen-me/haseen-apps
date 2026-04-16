import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../../constants';

export interface SubTextProps {
  children: React.ReactNode;
  error?: boolean;
  className?: string;
  style?: CSSProperties;
}

const SubText: React.FC<SubTextProps> = ({ children, error = false, className, style }) => {
  const computedStyle: CSSProperties = {
    fontSize: '0.6875rem',
    lineHeight: '1.36',
    fontFamily: FONT_FAMILY_SANS,
    color: error ? 'var(--hsn-text-destructive)' : 'var(--hsn-text-tertiary)',
    marginTop: '4px',
    ...style,
  };

  return (
    <span className={className} style={computedStyle}>
      {children}
    </span>
  );
};

SubText.displayName = 'SubText';

export default SubText;
