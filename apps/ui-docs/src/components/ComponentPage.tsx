import type { ReactNode } from 'react';

interface ComponentPageProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ComponentPage({ title, description, children }: ComponentPageProps) {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
      <p style={{
        fontSize: 16,
        color: 'var(--docs-text-secondary)',
        lineHeight: 1.7,
        marginBottom: 32,
        maxWidth: 640,
      }}>
        {description}
      </p>
      {children}
    </div>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{title}</h2>
      {description && (
        <p style={{ color: 'var(--docs-text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {children}
    </section>
  );
}
