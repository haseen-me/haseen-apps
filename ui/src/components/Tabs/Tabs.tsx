import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { transitions } from '../../tokens';

export enum TabsSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  size?: TabsSize;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
}

const HEIGHT_MAP: Record<TabsSize, number> = {
  [TabsSize.SMALL]: 28,
  [TabsSize.MEDIUM]: 32,
  [TabsSize.LARGE]: 36,
};

const FONT_SIZE_MAP: Record<TabsSize, string> = {
  [TabsSize.SMALL]: '0.6875rem',
  [TabsSize.MEDIUM]: '0.75rem',
  [TabsSize.LARGE]: '0.8125rem',
};

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  size = TabsSize.MEDIUM,
  fullWidth = false,
  className,
  style,
}) => {
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '2px',
    borderRadius: '8px',
    background: 'var(--hsn-bg-field-default)',
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  const tabStyle = (isActive: boolean, isDisabled: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: `${HEIGHT_MAP[size]}px`,
    padding: '0 12px',
    borderRadius: '6px',
    fontSize: FONT_SIZE_MAP[size],
    fontWeight: isActive ? 500 : 400,
    fontFamily: FONT_FAMILY_SANS,
    color: isActive ? 'var(--hsn-text-primary)' : 'var(--hsn-text-tertiary)',
    background: isActive ? 'var(--hsn-bg-l2-solid)' : 'transparent',
    boxShadow: isActive ? 'var(--hsn-shadow-l1)' : undefined,
    border: 'none',
    outline: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: `all ${transitions.normal} ${transitions.easing}`,
    flex: fullWidth ? 1 : undefined,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  });

  return (
    <div className={className} style={containerStyle} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={tabStyle(tab.id === activeTab, !!tab.disabled)}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          role="tab"
          aria-selected={tab.id === activeTab}
          disabled={tab.disabled}
        >
          {tab.icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

Tabs.displayName = 'Tabs';

export default Tabs;
