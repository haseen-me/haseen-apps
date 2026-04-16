import React, { CSSProperties } from 'react';

import { Size } from '../../types';

export interface FacepileProps {
  avatars: React.ReactNode[];
  max?: number;
  size?: Size;
  className?: string;
  style?: CSSProperties;
}

const SIZE_MAP: Record<string, number> = {
  [Size.X_SMALL]: 20,
  [Size.SMALL]: 24,
  [Size.MEDIUM]: 32,
  [Size.LARGE]: 40,
};

const Facepile: React.FC<FacepileProps> = ({
  avatars,
  max = 4,
  size = Size.MEDIUM,
  className,
  style,
}) => {
  const dim = SIZE_MAP[size] ?? 32;
  const overlap = Math.round(dim * 0.3);
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    ...style,
  };

  const itemStyle = (i: number): CSSProperties => ({
    marginLeft: i > 0 ? `-${overlap}px` : undefined,
    position: 'relative',
    zIndex: visible.length - i,
    border: '2px solid var(--hsn-bg-l2-solid)',
    borderRadius: '50%',
    lineHeight: 0,
  });

  const overflowStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${dim}px`,
    height: `${dim}px`,
    borderRadius: '50%',
    background: 'var(--hsn-bg-field-default)',
    fontSize: '0.625rem',
    fontWeight: 600,
    color: 'var(--hsn-text-secondary)',
    marginLeft: `-${overlap}px`,
    border: '2px solid var(--hsn-bg-l2-solid)',
  };

  return (
    <div className={className} style={containerStyle}>
      {visible.map((avatar, i) => (
        <div key={i} style={itemStyle(i)}>
          {avatar}
        </div>
      ))}
      {remaining > 0 && <div style={overflowStyle}>+{remaining}</div>}
    </div>
  );
};

Facepile.displayName = 'Facepile';

export default Facepile;
