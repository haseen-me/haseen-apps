import React, { CSSProperties } from 'react';

export enum DividerType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export interface DividerProps {
  type?: DividerType;
  color?: string;
  spacing?: number;
  className?: string;
  style?: CSSProperties;
}

const Divider: React.FC<DividerProps> = ({
  type = DividerType.HORIZONTAL,
  color,
  spacing = 0,
  className,
  style,
}) => {
  const isHorizontal = type === DividerType.HORIZONTAL;

  const computedStyle: CSSProperties = {
    background: color ?? 'var(--hsn-border-tertiary)',
    width: isHorizontal ? '100%' : '1px',
    height: isHorizontal ? '1px' : '100%',
    flexShrink: 0,
    margin: isHorizontal ? `${spacing}px 0` : `0 ${spacing}px`,
    border: 'none',
    ...style,
  };

  return <div className={className} style={computedStyle} role="separator" />;
};

Divider.displayName = 'Divider';

export default Divider;
