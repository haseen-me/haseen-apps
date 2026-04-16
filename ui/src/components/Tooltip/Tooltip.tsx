import React, { CSSProperties, useRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { zIndex, transitions } from '../../tokens';

export enum TooltipPlacement {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
}

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

const OFFSET = 8;

const placementStyles: Record<TooltipPlacement, CSSProperties> = {
  [TooltipPlacement.TOP]: {
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginBottom: `${OFFSET}px`,
  },
  [TooltipPlacement.BOTTOM]: {
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: `${OFFSET}px`,
  },
  [TooltipPlacement.LEFT]: {
    right: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginRight: `${OFFSET}px`,
  },
  [TooltipPlacement.RIGHT]: {
    left: '100%',
    top: '50%',
    transform: 'translateY(-50%)',
    marginLeft: `${OFFSET}px`,
  },
};

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = TooltipPlacement.TOP,
  delay = 200,
  className,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const tooltipStyle: CSSProperties = {
    position: 'absolute',
    zIndex: zIndex.popover,
    background: 'var(--hsn-bg-emphasis)',
    color: 'var(--hsn-text-inverse)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.6875rem',
    fontFamily: FONT_FAMILY_SANS,
    fontWeight: 500,
    lineHeight: '1.36',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: `opacity ${transitions.fast} ${transitions.easing}`,
    ...placementStyles[placement],
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {content && <div style={tooltipStyle} role="tooltip">{content}</div>}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export default Tooltip;
