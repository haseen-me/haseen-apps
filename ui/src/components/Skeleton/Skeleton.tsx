import React, { CSSProperties } from 'react';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  className?: string;
  style?: CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  className,
  style,
}) => {
  const computedStyle: CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
    background: 'var(--hsn-bg-field-default)',
    animation: 'hsnSkeletonPulse 1.5s ease-in-out infinite',
    ...style,
  };

  return <div className={className} style={computedStyle} />;
};

Skeleton.displayName = 'Skeleton';

export default Skeleton;
