import type { ReactNode } from 'react';

interface PreviewProps {
  children: ReactNode;
  label?: string;
}

export function Preview({ children, label }: PreviewProps) {
  return (
    <div style={{
      border: '1px solid var(--docs-border)',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 4,
    }}>
      {label && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--docs-bg-tertiary)',
          borderBottom: '1px solid var(--docs-border)',
          fontSize: 13,
          color: 'var(--docs-text-secondary)',
        }}>
          {label}
        </div>
      )}
      <div style={{
        padding: 24,
        background: 'var(--docs-preview-bg)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        {children}
      </div>
    </div>
  );
}
