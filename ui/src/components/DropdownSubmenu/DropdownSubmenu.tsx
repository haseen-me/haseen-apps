import React, { CSSProperties, useRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { transitions } from '../../tokens';

export interface DropdownSubmenuProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
}

const DropdownSubmenu: React.FC<DropdownSubmenuProps> = ({
  label,
  icon,
  children,
  className,
  style,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const triggerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontFamily: FONT_FAMILY_SANS,
    color: 'var(--hsn-text-primary)',
    background: open ? 'var(--hsn-bg-cell-hover)' : 'transparent',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    transition: `background ${transitions.fast} ${transitions.easing}`,
    userSelect: 'none',
  };

  const submenuStyle: CSSProperties = {
    position: 'absolute',
    left: '100%',
    top: 0,
    marginLeft: '4px',
    background: 'var(--hsn-bg-l2-solid)',
    border: '1px solid var(--hsn-border-secondary)',
    borderRadius: '8px',
    boxShadow: 'var(--hsn-shadow-l2)',
    padding: '4px',
    minWidth: '160px',
    zIndex: 1,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button style={triggerStyle} role="menuitem" aria-haspopup="true" aria-expanded={open}>
        {icon && (
          <span style={{ display: 'inline-flex', flexShrink: 0, color: 'var(--hsn-icon-secondary)' }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ display: 'inline-flex', color: 'var(--hsn-icon-tertiary)', fontSize: '10px' }}>
          ›
        </span>
      </button>
      {open && (
        <div style={submenuStyle} role="menu">
          {children}
        </div>
      )}
    </div>
  );
};

DropdownSubmenu.displayName = 'DropdownSubmenu';

export default DropdownSubmenu;
