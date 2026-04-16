import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';

export const BANNER_HEIGHT = 44;

export interface BannerProps {
  children: React.ReactNode;
  color?: 'default' | 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  style?: CSSProperties;
}

const COLOR_MAP = {
  default: {
    bg: 'var(--hsn-bg-field-default)',
    text: 'var(--hsn-text-primary)',
  },
  info: {
    bg: 'var(--hsn-accent-blue-secondary)',
    text: 'var(--hsn-accent-blue-primary)',
  },
  success: {
    bg: 'var(--hsn-accent-green-secondary)',
    text: 'var(--hsn-accent-green-primary)',
  },
  warning: {
    bg: 'var(--hsn-accent-yellow-secondary)',
    text: 'var(--hsn-accent-yellow-primary)',
  },
  error: {
    bg: 'var(--hsn-accent-red-secondary)',
    text: 'var(--hsn-accent-red-primary)',
  },
};

const Banner: React.FC<BannerProps> = ({
  children,
  color = 'default',
  icon,
  action,
  onDismiss,
  className,
  style,
}) => {
  const scheme = COLOR_MAP[color];

  const computedStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: `${BANNER_HEIGHT}px`,
    padding: '0 16px',
    background: scheme.bg,
    color: scheme.text,
    fontSize: '0.8125rem',
    fontWeight: 400,
    fontFamily: FONT_FAMILY_SANS,
    lineHeight: '1.38',
    width: '100%',
    ...style,
  };

  return (
    <div className={className} style={computedStyle} role="alert">
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {action}
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: scheme.text,
            cursor: 'pointer',
            padding: '4px',
            fontSize: '14px',
            lineHeight: 1,
            display: 'inline-flex',
          }}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
};

Banner.displayName = 'Banner';

export default Banner;
