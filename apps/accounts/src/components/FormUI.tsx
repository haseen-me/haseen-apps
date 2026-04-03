import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export function FormField({ label, error, icon, style, ...props }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--acc-text-secondary)',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--acc-text-muted)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}
        <input
          style={{
            width: '100%',
            padding: icon ? '10px 12px 10px 38px' : '10px 12px',
            borderRadius: 'var(--acc-radius-sm)',
            border: `1px solid ${error ? 'var(--acc-danger)' : 'var(--acc-border)'}`,
            fontSize: 14,
            fontFamily: 'inherit',
            color: 'var(--acc-text)',
            background: 'var(--acc-bg-card)',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: 12, color: 'var(--acc-danger)', marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  loading,
  fullWidth,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const bg =
    variant === 'primary'
      ? 'var(--acc-brand)'
      : variant === 'danger'
        ? 'var(--acc-danger)'
        : 'transparent';
  const color =
    variant === 'secondary' ? 'var(--acc-text)' : '#fff';
  const border =
    variant === 'secondary' ? '1px solid var(--acc-border)' : 'none';

  return (
    <button
      disabled={disabled || loading}
      style={{
        width: fullWidth ? '100%' : undefined,
        padding: '10px 20px',
        borderRadius: 'var(--acc-radius-sm)',
        background: bg,
        color,
        border,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : null}
      {children}
    </button>
  );
}

export function Divider({ text }: { text?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '20px 0',
      }}
    >
      <div style={{ flex: 1, height: 1, background: 'var(--acc-border)' }} />
      {text && (
        <span style={{ fontSize: 12, color: 'var(--acc-text-muted)', whiteSpace: 'nowrap' }}>
          {text}
        </span>
      )}
      <div style={{ flex: 1, height: 1, background: 'var(--acc-border)' }} />
    </div>
  );
}

export function Alert({ type, children }: { type: 'error' | 'success' | 'warning' | 'info'; children: ReactNode }) {
  const colors = {
    error: { bg: 'var(--acc-danger-subtle)', border: 'var(--acc-danger)', text: 'var(--acc-danger)' },
    success: { bg: 'rgba(48,164,108,0.08)', border: 'var(--acc-success)', text: 'var(--acc-success)' },
    warning: { bg: 'rgba(245,166,35,0.08)', border: 'var(--acc-warning)', text: '#b47d14' },
    info: { bg: 'var(--acc-brand-subtle)', border: 'var(--acc-brand)', text: 'var(--acc-brand)' },
  };
  const c = colors[type];

  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--acc-radius-sm)',
        background: c.bg,
        borderLeft: `3px solid ${c.border}`,
        fontSize: 13,
        color: c.text,
        lineHeight: 1.5,
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  );
}
