import React, { CSSProperties, forwardRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../../constants';
import { transitions } from '../../../tokens';

export interface TextAreaProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  rows?: number;
  maxLength?: number;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder,
      disabled = false,
      readOnly = false,
      error = false,
      rows = 3,
      maxLength,
      autoFocus,
      name,
      id,
      className,
      style,
      dataTestId,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [hovered, setHovered] = useState(false);

    let border = '1px solid var(--hsn-border-input)';
    let background = 'var(--hsn-bg-field-default)';
    let boxShadow = 'none';

    if (disabled) {
      border = '1px solid var(--hsn-border-primary)';
      background = 'var(--hsn-bg-field-disabled)';
    } else if (error && focused) {
      border = '1px solid var(--hsn-border-input-error)';
      background = 'var(--hsn-bg-field-error)';
      boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
    } else if (error) {
      border = '1px solid var(--hsn-border-input-error)';
      background = 'var(--hsn-bg-field-error)';
    } else if (focused) {
      border = '1px solid var(--hsn-border-input-focus)';
      background = 'var(--hsn-bg-field-default)';
      boxShadow = '0 0 0 3px rgba(45, 184, 175, 0.15)';
    } else if (hovered) {
      border = '1px solid var(--hsn-border-input-hover)';
      background = 'var(--hsn-bg-field-hover)';
    }

    const wrapperStyle: CSSProperties = {
      display: 'flex',
      padding: '8px 12px',
      borderRadius: '6px',
      background,
      border,
      boxShadow,
      transition: `border-color ${transitions.fast} ${transitions.easing}, box-shadow ${transitions.fast} ${transitions.easing}, background ${transitions.fast} ${transitions.easing}`,
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      width: '100%',
      ...style,
    };

    const textAreaStyle: CSSProperties = {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: '0.8125rem',
      fontFamily: FONT_FAMILY_SANS,
      fontWeight: 400,
      color: disabled ? 'var(--hsn-text-disabled)' : 'var(--hsn-text-primary)',
      caretColor: 'var(--hsn-border-input-focus)',
      resize: 'vertical',
      padding: 0,
      width: '100%',
      lineHeight: '1.6',
      cursor: disabled ? 'not-allowed' : 'text',
    };

    return (
      <div
        className={className}
        style={wrapperStyle}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          autoFocus={autoFocus}
          name={name}
          id={id}
          style={textAreaStyle}
          data-testid={dataTestId}
          aria-invalid={error || undefined}
        />
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
