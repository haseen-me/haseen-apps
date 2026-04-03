import { ComponentPage, Section } from '@/components/ComponentPage';
import { CodeBlock } from '@/components/CodeBlock';

const PALETTE_GROUPS = [
  {
    name: 'Neutral',
    colors: [
      { name: '--hsn-white', value: '#ffffff' },
      { name: '--hsn-black', value: '#0d0d0d' },
      { name: '--hsn-grey-100', value: '#f7f7f7' },
      { name: '--hsn-grey-200', value: '#ebebeb' },
      { name: '--hsn-grey-300', value: '#d4d4d4' },
      { name: '--hsn-grey-400', value: '#a3a3a3' },
      { name: '--hsn-grey-500', value: '#737373' },
      { name: '--hsn-grey-600', value: '#525252' },
      { name: '--hsn-grey-700', value: '#404040' },
      { name: '--hsn-grey-800', value: '#262626' },
      { name: '--hsn-grey-900', value: '#171717' },
    ],
  },
  {
    name: 'Teal (Brand)',
    colors: [
      { name: '--hsn-teal-100', value: '#e6faf8' },
      { name: '--hsn-teal-200', value: '#b3f0eb' },
      { name: '--hsn-teal-300', value: '#80e6dd' },
      { name: '--hsn-teal-400', value: '#4ddcd0' },
      { name: '--hsn-teal-500', value: '#2db8af' },
      { name: '--hsn-teal-600', value: '#24958c' },
      { name: '--hsn-teal-700', value: '#1b7269' },
      { name: '--hsn-teal-800', value: '#124f47' },
    ],
  },
  {
    name: 'Red',
    colors: [
      { name: '--hsn-red-100', value: '#fef2f2' },
      { name: '--hsn-red-200', value: '#fecaca' },
      { name: '--hsn-red-300', value: '#fca5a5' },
      { name: '--hsn-red-400', value: '#f87171' },
      { name: '--hsn-red-500', value: '#ef4444' },
      { name: '--hsn-red-600', value: '#dc2626' },
      { name: '--hsn-red-700', value: '#b91c1c' },
      { name: '--hsn-red-800', value: '#991b1b' },
    ],
  },
  {
    name: 'Green',
    colors: [
      { name: '--hsn-green-100', value: '#f0fdf4' },
      { name: '--hsn-green-200', value: '#bbf7d0' },
      { name: '--hsn-green-300', value: '#86efac' },
      { name: '--hsn-green-400', value: '#4ade80' },
      { name: '--hsn-green-500', value: '#22c55e' },
      { name: '--hsn-green-600', value: '#16a34a' },
      { name: '--hsn-green-700', value: '#15803d' },
      { name: '--hsn-green-800', value: '#166534' },
    ],
  },
  {
    name: 'Blue',
    colors: [
      { name: '--hsn-blue-100', value: '#eff6ff' },
      { name: '--hsn-blue-200', value: '#bfdbfe' },
      { name: '--hsn-blue-300', value: '#93c5fd' },
      { name: '--hsn-blue-400', value: '#60a5fa' },
      { name: '--hsn-blue-500', value: '#3b82f6' },
      { name: '--hsn-blue-600', value: '#2563eb' },
      { name: '--hsn-blue-700', value: '#1d4ed8' },
      { name: '--hsn-blue-800', value: '#1e40af' },
    ],
  },
  {
    name: 'Orange',
    colors: [
      { name: '--hsn-orange-100', value: '#fff7ed' },
      { name: '--hsn-orange-200', value: '#fed7aa' },
      { name: '--hsn-orange-300', value: '#fdba74' },
      { name: '--hsn-orange-400', value: '#fb923c' },
      { name: '--hsn-orange-500', value: '#f97316' },
      { name: '--hsn-orange-600', value: '#ea580c' },
      { name: '--hsn-orange-700', value: '#c2410c' },
      { name: '--hsn-orange-800', value: '#9a3412' },
    ],
  },
];

export function ColorPage() {
  return (
    <ComponentPage
      title="Color"
      description="Design system color palette and token names. All colors are available as CSS custom properties prefixed with --hsn-."
    >
      {PALETTE_GROUPS.map((group) => (
        <Section key={group.name} title={group.name}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 8,
            marginBottom: 16,
          }}>
            {group.colors.map((c) => (
              <div key={c.name} style={{
                borderRadius: 8,
                border: '1px solid var(--docs-border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: 56,
                  background: c.value,
                  borderBottom: '1px solid var(--docs-border)',
                }} />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{
                    fontSize: 11,
                    fontFamily: 'var(--docs-font-mono)',
                    color: 'var(--docs-text-primary)',
                    marginBottom: 2,
                  }}>
                    {c.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontFamily: 'var(--docs-font-mono)',
                    color: 'var(--docs-text-tertiary)',
                  }}>
                    {c.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}

      <Section title="Semantic tokens" description="Use semantic tokens for themed usage. These adapt to light/dark mode.">
        <CodeBlock
          code={`/* Text */
color: var(--hsn-text-primary);
color: var(--hsn-text-secondary);
color: var(--hsn-text-tertiary);
color: var(--hsn-text-disabled);
color: var(--hsn-text-link);
color: var(--hsn-text-destructive);

/* Background */
background: var(--hsn-bg-main-container);
background: var(--hsn-bg-l1-solid);
background: var(--hsn-bg-l2-solid);
background: var(--hsn-bg-l3-solid);
background: var(--hsn-bg-emphasis);

/* Border */
border-color: var(--hsn-border-primary);
border-color: var(--hsn-border-secondary);
border-color: var(--hsn-border-hover);

/* Shadows */
box-shadow: var(--hsn-shadow-l1);
box-shadow: var(--hsn-shadow-l2);
box-shadow: var(--hsn-shadow-dropdown);`}
          language="css"
          title="Semantic CSS variables"
        />
      </Section>
    </ComponentPage>
  );
}
