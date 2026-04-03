import { ComponentPage, Section } from '@/components/ComponentPage';
import { CodeBlock } from '@/components/CodeBlock';

export function TokensPage() {
  return (
    <ComponentPage
      title="Design Tokens"
      description="Shared design tokens for spacing, radii, typography, elevation, and transitions."
    >
      <Section title="Spacing" description="Consistent spacing scale.">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          {[2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((val) => (
            <div key={val} style={{ textAlign: 'center' }}>
              <div style={{
                width: val,
                height: val,
                background: 'var(--docs-accent)',
                borderRadius: 2,
                opacity: 0.7,
                marginBottom: 6,
              }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--docs-font-mono)', color: 'var(--docs-text-tertiary)' }}>
                {val}
              </span>
            </div>
          ))}
        </div>
        <CodeBlock
          code={`import { spacing } from '@haseen-me/ui';

// spacing = { xs: 2, sm: 4, md: 8, lg: 16, xl: 24, xxl: 32 }`}
          title="Spacing tokens"
        />
      </Section>

      <Section title="Border Radius" description="Consistent rounding scale.">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
          {[0, 2, 4, 6, 8, 12, 16, 9999].map((r) => (
            <div key={r} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                background: 'var(--docs-accent)',
                borderRadius: r,
                opacity: 0.7,
                marginBottom: 6,
              }} />
              <span style={{ fontSize: 11, fontFamily: 'var(--docs-font-mono)', color: 'var(--docs-text-tertiary)' }}>
                {r === 9999 ? 'full' : r}
              </span>
            </div>
          ))}
        </div>
        <CodeBlock
          code={`import { radii } from '@haseen-me/ui';

// radii = { none: 0, sm: 2, md: 4, lg: 8, xl: 12, full: 9999 }`}
          title="Border radius tokens"
        />
      </Section>

      <Section title="Typography Scale">
        <CodeBlock
          code={`import { fontSizes, fontWeights, lineHeights } from '@haseen-me/ui';

// fontSizes = { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32 }
// fontWeights = { regular: 400, medium: 500, semibold: 600, bold: 700 }
// lineHeights = { tight: 1.2, normal: 1.5, relaxed: 1.7 }`}
          title="Typography tokens"
        />
      </Section>

      <Section title="Z-Index Scale">
        <CodeBlock
          code={`import { zIndex } from '@haseen-me/ui';

// zIndex = { base: 0, dropdown: 100, sticky: 200, overlay: 300, modal: 400, toast: 500, tooltip: 600 }`}
          title="Z-index tokens"
        />
      </Section>

      <Section title="Transitions">
        <CodeBlock
          code={`import { transitions } from '@haseen-me/ui';

// transitions = {
//   fast: '0.1s ease',
//   normal: '0.2s ease',
//   slow: '0.3s ease',
//   spring: '0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
// }`}
          title="Transition tokens"
        />
      </Section>
    </ComponentPage>
  );
}
