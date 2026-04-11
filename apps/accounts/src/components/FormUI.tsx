import type { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export function FormField({ label, error, icon, style, ...props }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--acc-text-secondary)',
          marginBottom: 8,
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
            padding: icon ? '14px 16px 14px 44px' : '14px 16px',
            borderRadius: '18px',
            border: `1px solid ${error ? 'var(--acc-danger)' : 'var(--acc-border)'}`,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            fontFamily: 'inherit',
            color: 'var(--acc-text)',
            background: 'var(--acc-bg-elevated)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
            transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
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
        padding: '14px 22px',
        borderRadius: '18px',
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, var(--acc-brand), var(--acc-brand-2))'
            : bg,
        color,
        border,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.15s, background 0.15s, box-shadow 0.2s',
        boxShadow:
          variant === 'primary'
            ? '0 24px 36px -24px rgba(45, 184, 175, 0.65)'
            : '0 12px 28px -24px rgba(15, 23, 42, 0.28)',
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
        borderRadius: '18px',
        background: c.bg,
        border: `1px solid ${c.border}`,
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
