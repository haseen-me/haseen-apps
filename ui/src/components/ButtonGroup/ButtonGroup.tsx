import React, { CSSProperties } from 'react';

export interface ButtonGroupProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, fullWidth, className, style }) => {
  const computedStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0,
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  // Wrap children to apply border-radius merging
  const items = React.Children.toArray(children);

  return (
    <div className={className} style={computedStyle} role="group">
      {items.map((child, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: fullWidth ? 1 : undefined,
              borderRadius: isFirst
                ? '8px 0 0 8px'
                : isLast
                  ? '0 8px 8px 0'
                  : '0',
              overflow: 'hidden',
              marginLeft: i > 0 ? '-1px' : undefined,
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
