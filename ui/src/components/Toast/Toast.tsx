import React, { CSSProperties, useEffect, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { zIndex, transitions } from '../../tokens';

export const TOAST_DEFAULT_DURATION = 4000;

export interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  onDismiss,
  duration = TOAST_DEFAULT_DURATION,
  action,
  icon,
  className,
  style,
}) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  if (!show) return null;

  const toastStyle: CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: zIndex.toast,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    background: 'var(--hsn-bg-emphasis)',
    color: 'var(--hsn-text-inverse)',
    boxShadow: 'var(--hsn-shadow-l2)',
    fontSize: '0.8125rem',
    fontWeight: 400,
    fontFamily: FONT_FAMILY_SANS,
    lineHeight: '1.38',
    whiteSpace: 'nowrap',
    animation: `hsnSlideUp ${transitions.normal} ${transitions.easing}`,
    ...style,
  };

  const actionStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--hsn-accent-teal-primary)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    padding: '0 4px',
    fontFamily: FONT_FAMILY_SANS,
  };

  return (
    <div className={className} style={toastStyle} role="alert">
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span>{message}</span>
      {action && (
        <button style={actionStyle} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

Toast.displayName = 'Toast';

export default Toast;
