import React, { CSSProperties } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';

export interface KeyCodeSequenceProps {
  keys: string[];
  className?: string;
  style?: CSSProperties;
}

const KeyCodeSequence: React.FC<KeyCodeSequenceProps> = ({ keys, className, style }) => {
  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    ...style,
  };

  const keyStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    padding: '0 4px',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 500,
    fontFamily: FONT_FAMILY_SANS,
    color: 'var(--hsn-text-tertiary)',
    background: 'var(--hsn-bg-field-default)',
    border: '1px solid var(--hsn-border-tertiary)',
    lineHeight: 1,
    textTransform: 'uppercase',
  };

  return (
    <span className={className} style={containerStyle}>
      {keys.map((key, i) => (
        <kbd key={i} style={keyStyle}>
          {key}
        </kbd>
      ))}
    </span>
  );
};

KeyCodeSequence.displayName = 'KeyCodeSequence';

export default KeyCodeSequence;
