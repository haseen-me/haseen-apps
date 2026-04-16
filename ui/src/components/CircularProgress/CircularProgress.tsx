import React, { CSSProperties } from 'react';

export enum CircularProgressSize {
  SMALL = 16,
  MEDIUM = 24,
  LARGE = 32,
  X_LARGE = 48,
}

export const PROGRESS_SIZE = CircularProgressSize;

export interface CircularProgressProps {
  size?: CircularProgressSize | number;
  color?: string;
  thickness?: number;
  className?: string;
  style?: CSSProperties;
}

export const AbsolutelyCentered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  >
    {children}
  </div>
);

export const RelativelyCentered: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    }}
  >
    {children}
  </div>
);

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = CircularProgressSize.MEDIUM,
  color,
  thickness = 2,
  className,
  style,
}) => {
  const dim = typeof size === 'number' ? size : size;

  const computedStyle: CSSProperties = {
    width: `${dim}px`,
    height: `${dim}px`,
    borderRadius: '50%',
    border: `${thickness}px solid var(--hsn-border-tertiary)`,
    borderTopColor: color ?? 'var(--hsn-accent-teal-primary)',
    animation: 'hsnSpin 0.8s linear infinite',
    boxSizing: 'border-box',
    ...style,
  };

  return <div className={className} style={computedStyle} role="progressbar" />;
};

CircularProgress.displayName = 'CircularProgress';

export default CircularProgress;
