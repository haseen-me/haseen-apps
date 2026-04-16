import React, { CSSProperties, useRef, useState, useEffect, useCallback } from 'react';

import { FONT_FAMILY_MONO } from '../../constants';
import { transitions } from '../../tokens';

export enum CodeInputType {
  NUMERIC = 'numeric',
  ALPHANUMERIC = 'alphanumeric',
}

export interface CodeInputProps {
  length?: number;
  type?: CodeInputType;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  type = CodeInputType.NUMERIC,
  onComplete,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
  style,
  dataTestId,
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const isValid = useCallback(
    (char: string): boolean => {
      if (type === CodeInputType.NUMERIC) return /^\d$/.test(char);
      return /^[a-zA-Z0-9]$/.test(char);
    },
    [type]
  );

  const handleChange = (index: number, char: string) => {
    if (!isValid(char) && char !== '') return;

    const newValues = [...values];
    newValues[index] = char;
    setValues(newValues);

    const code = newValues.join('');
    onChange?.(code);

    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (code.length === length && !code.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, length);
    const newValues = [...values];
    for (let i = 0; i < pasted.length; i++) {
      if (isValid(pasted[i])) {
        newValues[i] = pasted[i];
      }
    }
    setValues(newValues);
    const code = newValues.join('');
    onChange?.(code);
    if (code.length === length) onComplete?.(code);

    const nextEmpty = newValues.findIndex((v) => !v);
    if (nextEmpty >= 0) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
    }
  };

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    gap: '8px',
    ...style,
  };

  const inputStyle: CSSProperties = {
    width: '40px',
    height: '48px',
    textAlign: 'center',
    fontSize: '1.25rem',
    fontWeight: 600,
    fontFamily: FONT_FAMILY_MONO,
    color: 'var(--hsn-text-primary)',
    background: 'var(--hsn-bg-field-default)',
    border: '1px solid var(--hsn-border-secondary)',
    borderRadius: '8px',
    outline: 'none',
    transition: `border-color ${transitions.normal} ${transitions.easing}`,
    caretColor: 'var(--hsn-accent-teal-primary)',
  };

  return (
    <div className={className} style={containerStyle} data-testid={dataTestId} onPaste={handlePaste}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode={type === CodeInputType.NUMERIC ? 'numeric' : 'text'}
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          style={inputStyle}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

CodeInput.displayName = 'CodeInput';

export default CodeInput;
