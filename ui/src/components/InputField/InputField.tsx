import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { SubText } from './SubText';

export interface InputFieldProps {
  label?: string;
  subText?: string;
  error?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  subText,
  error = false,
  children,
  className,
  style,
}) => {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
    ...style,
  };

  const labelStyle: CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 500,
    fontFamily: FONT_FAMILY_SANS,
    color: 'var(--hsn-text-secondary)',
    marginBottom: '2px',
  };

  return (
    <div className={className} style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
      {subText && <SubText error={error}>{subText}</SubText>}
    </div>
  );
};

InputField.displayName = 'InputField';

export default InputField;
