import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import { FONT_FAMILY_SANS } from '../../constants';
import { transitions, zIndex } from '../../tokens';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[];
  value?: T;
  onChange?: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  width?: number | string;
  className?: string;
  style?: CSSProperties;
  dataTestId?: string;
}

function Select<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  error = false,
  width,
  className,
  style,
  dataTestId,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, close]);

  // Arrow key navigation
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    } else if (e.key === 'Escape' && open) {
      e.preventDefault();
      close();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const enabled = options
      .map((opt, i) => ({ opt, i }))
      .filter(({ opt }) => !opt.disabled);

    const currentEnabledIdx = enabled.findIndex(({ i }) => i === focusedIndex);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(currentEnabledIdx + 1, enabled.length - 1);
      setFocusedIndex(enabled[next].i);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(currentEnabledIdx - 1, 0);
      setFocusedIndex(enabled[prev].i);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
        onChange?.(options[focusedIndex].value);
        close();
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      close();
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (enabled.length > 0) setFocusedIndex(enabled[0].i);
    } else if (e.key === 'End') {
      e.preventDefault();
      if (enabled.length > 0) setFocusedIndex(enabled[enabled.length - 1].i);
    }
  };

  // Resolve trigger border/background state
  let triggerBorder = `1px solid var(--hsn-border-input)`;
  let triggerBackground = 'var(--hsn-bg-field-default)';
  let triggerShadow = 'none';

  if (disabled) {
    triggerBorder = '1px solid var(--hsn-border-primary)';
    triggerBackground = 'var(--hsn-bg-field-disabled)';
  } else if (error && (open || focused)) {
    triggerBorder = '1px solid var(--hsn-border-input-error)';
    triggerBackground = 'var(--hsn-bg-field-error)';
    triggerShadow = '0 0 0 3px rgba(239, 68, 68, 0.15)';
  } else if (error) {
    triggerBorder = '1px solid var(--hsn-border-input-error)';
    triggerBackground = 'var(--hsn-bg-field-error)';
  } else if (open || focused) {
    triggerBorder = '1px solid var(--hsn-border-input-focus)';
    triggerBackground = 'var(--hsn-bg-field-default)';
    triggerShadow = '0 0 0 3px rgba(45, 184, 175, 0.15)';
  }

  const resolvedWidth = typeof width === 'number' ? `${width}px` : (width ?? '100%');

  const triggerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '36px',
    padding: '0 12px',
    borderRadius: '6px',
    background: triggerBackground,
    border: triggerBorder,
    boxShadow: triggerShadow,
    fontSize: '0.8125rem',
    fontFamily: FONT_FAMILY_SANS,
    color: selected ? 'var(--hsn-text-primary)' : 'var(--hsn-text-tertiary)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: `border-color ${transitions.fast} ${transitions.easing}, box-shadow ${transitions.fast} ${transitions.easing}, background ${transitions.fast} ${transitions.easing}`,
    width: resolvedWidth,
    outline: 'none',
    userSelect: 'none',
    textAlign: 'left',
    ...style,
  };

  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--hsn-bg-l2-solid)',
    border: '1px solid var(--hsn-border-primary)',
    borderRadius: '6px',
    boxShadow: 'var(--hsn-shadow-dropdown)',
    padding: '4px',
    zIndex: zIndex.dropdown,
    maxHeight: '240px',
    overflowY: 'auto',
    outline: 'none',
    animation: `hsnDropdownIn ${transitions.normal} ${transitions.easing}`,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', width: resolvedWidth }}
      data-testid={dataTestId}
    >
      <button
        ref={triggerRef}
        style={triggerStyle}
        onClick={() => !disabled && setOpen(!open)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={error || undefined}
      >
        {selected?.icon && (
          <span style={{ display: 'inline-flex', flexShrink: 0 }}>{selected.icon}</span>
        )}
        <span style={{ flex: 1 }}>{selected?.label ?? placeholder}</span>
        <span
          style={{
            display: 'inline-flex',
            color: 'var(--hsn-icon-tertiary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: `transform ${transitions.fast} ${transitions.easing}`,
            fontSize: '10px',
          }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          ref={listboxRef}
          style={dropdownStyle}
          role="listbox"
          aria-label="Options"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIndex;
            const isDisabled = !!opt.disabled;

            const itemStyle: CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '0.8125rem',
              fontFamily: FONT_FAMILY_SANS,
              color: isDisabled
                ? 'var(--hsn-text-disabled)'
                : isSelected
                  ? 'var(--hsn-text-primary)'
                  : 'var(--hsn-text-primary)',
              background: isSelected
                ? 'var(--hsn-bg-cell-selected)'
                : isFocused
                  ? 'var(--hsn-bg-cell-hover)'
                  : 'transparent',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              border: 'none',
              outline: isFocused ? 'none' : 'none',
              boxShadow: isFocused ? 'var(--hsn-focus-ring)' : 'none',
              width: '100%',
              textAlign: 'left',
              transition: `background ${transitions.fast} ${transitions.easing}`,
              fontWeight: isSelected ? 500 : 400,
            };

            return (
              <button
                key={String(opt.value)}
                style={itemStyle}
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    onChange?.(opt.value);
                    close();
                  }
                }}
                onMouseEnter={() => !isDisabled && setFocusedIndex(idx)}
                onMouseLeave={() => setFocusedIndex(-1)}
              >
                {opt.icon && (
                  <span style={{ display: 'inline-flex', flexShrink: 0 }}>{opt.icon}</span>
                )}
                {opt.label}
                {isSelected && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--hsn-border-input-focus)',
                      fontSize: '12px',
                    }}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

Select.displayName = 'Select';

export default Select;
