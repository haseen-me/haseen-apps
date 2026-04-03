import { ButtonGroup, Button, Type } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function ButtonGroupPage() {
  return (
    <ComponentPage
      title="ButtonGroup"
      description="A container that groups related buttons together with consistent spacing and layout."
    >
      <Section title="Default" description="A group of buttons displayed inline.">
        <Preview>
          <ButtonGroup>
            <Button type={Type.SECONDARY}>Left</Button>
            <Button type={Type.SECONDARY}>Center</Button>
            <Button type={Type.SECONDARY}>Right</Button>
          </ButtonGroup>
        </Preview>
        <CodeBlock
          code={`import { ButtonGroup, Button, Type } from '@haseen-me/ui';

<ButtonGroup>
  <Button type={Type.SECONDARY}>Left</Button>
  <Button type={Type.SECONDARY}>Center</Button>
  <Button type={Type.SECONDARY}>Right</Button>
</ButtonGroup>`}
          title="Example: Button group"
        />
      </Section>

      <Section title="Full width" description="The group stretches to fill its container.">
        <Preview>
          <div style={{ width: '100%' }}>
            <ButtonGroup fullWidth>
              <Button type={Type.SECONDARY}>Option A</Button>
              <Button type={Type.SECONDARY}>Option B</Button>
              <Button type={Type.SECONDARY}>Option C</Button>
            </ButtonGroup>
          </div>
        </Preview>
        <CodeBlock
          code={`<ButtonGroup fullWidth>
  <Button type={Type.SECONDARY}>Option A</Button>
  <Button type={Type.SECONDARY}>Option B</Button>
  <Button type={Type.SECONDARY}>Option C</Button>
</ButtonGroup>`}
          title="Example: Full width"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Button elements to group' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to fill container width' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
