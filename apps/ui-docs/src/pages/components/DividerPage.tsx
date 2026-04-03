import { Divider, DividerType } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function DividerPage() {
  return (
    <ComponentPage
      title="Divider"
      description="A visual separator used to divide content into distinct sections, available in horizontal and vertical orientations."
    >
      <Section title="Horizontal" description="Default horizontal divider spanning the full width.">
        <Preview>
          <div style={{ width: '100%' }}>
            <p>Content above</p>
            <Divider />
            <p>Content below</p>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Divider } from '@haseen-me/ui';

<p>Content above</p>
<Divider />
<p>Content below</p>`}
          title="Example: Horizontal divider"
        />
      </Section>

      <Section title="Vertical" description="Vertical divider for side-by-side layouts.">
        <Preview>
          <div style={{ display: 'flex', alignItems: 'center', height: 40, gap: 12 }}>
            <span>Left</span>
            <Divider type={DividerType.VERTICAL} />
            <span>Right</span>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Divider, DividerType } from '@haseen-me/ui';

<div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
  <span>Left</span>
  <Divider type={DividerType.VERTICAL} />
  <span>Right</span>
</div>`}
          title="Example: Vertical divider"
        />
      </Section>

      <Section title="With spacing" description="Add vertical spacing around horizontal dividers.">
        <Preview>
          <div style={{ width: '100%' }}>
            <p>Content above</p>
            <Divider spacing={16} />
            <p>Content below with extra spacing</p>
          </div>
        </Preview>
        <CodeBlock
          code={`<Divider spacing={16} />`}
          title="Example: With spacing"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'type', type: 'DividerType', default: 'DividerType.HORIZONTAL', description: 'Divider orientation' },
          { name: 'color', type: 'string', description: 'Custom divider color' },
          { name: 'spacing', type: 'number', description: 'Spacing around the divider in pixels' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
