import React, { CSSProperties, forwardRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../../constants';
import { sizeHeight, transitions } from '../../../tokens';
import { Size } from '../../../types';

// ─── Types ──────────────────────────────────────────────────────────────────────

export enum InputType {
  TEXT = 'text',
  PASSWORD = 'password',
  EMAIL = 'email',
  NUMBER = 'number',
  SEARCH = 'search',
  URL = 'url',
  TEL = 'tel',
}

export enum InputFieldSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface InputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: InputType;
  size?: InputFieldSize;
  disabled?: boolean;
  readOnly?: boolean;
  error?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

// ─── Style helpers ──────────────────────────────────────────────────────────────

const FONT_SIZE_MAP: Record<InputFieldSize, string> = {
  [InputFieldSize.SMALL]: '0.75rem',
  [InputFieldSize.MEDIUM]: '0.8125rem',
  [InputFieldSize.LARGE]: '0.875rem',
};

// Resolves wrapper border and background based on focus/error/disabled states.
// The focus state uses --hsn-border-input-focus (brand teal) as a 1px border
// plus a subtle teal ring so it works for mouse AND keyboard users identically.
function getWrapperTokens(
  focused: boolean,
  hovered: boolean,
  error: boolean,
  disabled: boolean
): { border: string; background: string; boxShadow: string } {
  if (disabled) {
    return {
      border: '1px solid var(--hsn-border-primary)',
      background: 'var(--hsn-bg-field-disabled)',
      boxShadow: 'none',
    };
  }
  if (error && focused) {
    return {
      border: '1px solid var(--hsn-border-input-error)',
      background: 'var(--hsn-bg-field-error)',
      boxShadow: `0 0 0 3px rgba(239, 68, 68, 0.15)`,
    };
  }
  if (error) {
    return {
      border: '1px solid var(--hsn-border-input-error)',
      background: 'var(--hsn-bg-field-error)',
      boxShadow: 'none',
    };
  }
  if (focused) {
    return {
      border: '1px solid var(--hsn-border-input-focus)',
      background: 'var(--hsn-bg-field-default)',
      boxShadow: `0 0 0 3px rgba(45, 184, 175, 0.15)`,
    };
  }
  if (hovered) {
    return {
      border: '1px solid var(--hsn-border-input-hover)',
      background: 'var(--hsn-bg-field-hover)',
      boxShadow: 'none',
    };
  }
  return {
    border: '1px solid var(--hsn-border-input)',
    background: 'var(--hsn-bg-field-default)',
    boxShadow: 'none',
  };
}

// ─── Component ──────────────────────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      placeholder,
      type = InputType.TEXT,
      size = InputFieldSize.MEDIUM,
      disabled = false,
      readOnly = false,
      error = false,
      startIcon,
      endIcon,
      autoFocus,
      autoComplete,
      maxLength,
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

    const height = sizeHeight[size as keyof typeof sizeHeight]
      ?? sizeHeight[Size.MEDIUM as keyof typeof sizeHeight];

    const tokens = getWrapperTokens(focused, hovered, error, disabled);

    const wrapperStyle: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      height: `${height}px`,
      padding: size === InputFieldSize.SMALL ? '0 10px' : '0 12px',
      borderRadius: '6px',
      background: tokens.background,
      border: tokens.border,
      boxShadow: tokens.boxShadow,
      transition: `border-color ${transitions.fast} ${transitions.easing}, box-shadow ${transitions.fast} ${transitions.easing}, background ${transitions.fast} ${transitions.easing}`,
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.6 : 1,
      width: '100%',
      ...style,
    };

    const inputStyle: CSSProperties = {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontSize: FONT_SIZE_MAP[size],
      fontFamily: FONT_FAMILY_SANS,
      fontWeight: 400,
      color: disabled ? 'var(--hsn-text-disabled)' : 'var(--hsn-text-primary)',
      caretColor: 'var(--hsn-border-input-focus)',
      padding: 0,
      width: '100%',
      height: '100%',
      cursor: disabled ? 'not-allowed' : 'text',
    };

    const iconStyle: CSSProperties = {
      display: 'inline-flex',
      flexShrink: 0,
      color: error
        ? 'var(--hsn-icon-destructive)'
        : focused
          ? 'var(--hsn-border-input-focus)'
          : 'var(--hsn-icon-tertiary)',
      transition: `color ${transitions.fast} ${transitions.easing}`,
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    return (
      <div
        className={className}
        style={wrapperStyle}
        onMouseEnter={() => !disabled && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-focused={focused || undefined}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
      >
        {startIcon && <span style={iconStyle}>{startIcon}</span>}
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          type={type}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          name={name}
          id={id}
          style={inputStyle}
          data-testid={dataTestId}
          aria-invalid={error || undefined}
        />
        {endIcon && <span style={iconStyle}>{endIcon}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
