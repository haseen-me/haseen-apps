import { Surface, Typography } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function SurfacePage() {
  return (
    <ComponentPage
      title="Surface"
      description="A container with elevation levels and optional glass effects, used as the foundational building block for cards, panels, and overlays."
    >
      <Section title="Levels" description="Surfaces support four elevation levels that affect background brightness.">
        <Preview>
          <Surface level="l0" padding={16} rounded><Typography>Level 0</Typography></Surface>
          <Surface level="l1" padding={16} rounded><Typography>Level 1</Typography></Surface>
          <Surface level="l2" padding={16} rounded><Typography>Level 2</Typography></Surface>
          <Surface level="l3" padding={16} rounded><Typography>Level 3</Typography></Surface>
        </Preview>
        <CodeBlock
          code={`import { Surface, Typography } from '@haseen-me/ui';

<Surface level="l0" padding={16} rounded><Typography>Level 0</Typography></Surface>
<Surface level="l1" padding={16} rounded><Typography>Level 1</Typography></Surface>
<Surface level="l2" padding={16} rounded><Typography>Level 2</Typography></Surface>
<Surface level="l3" padding={16} rounded><Typography>Level 3</Typography></Surface>`}
          title="Example: Surface levels"
        />
      </Section>

      <Section title="Variants" description="Solid and glass variants for different visual effects.">
        <Preview>
          <Surface level="l2" variant="solid" padding={16} rounded>
            <Typography>Solid</Typography>
          </Surface>
          <Surface level="l2" variant="glass" padding={16} rounded>
            <Typography>Glass</Typography>
          </Surface>
        </Preview>
        <CodeBlock
          code={`<Surface level="l2" variant="solid" padding={16} rounded>
  <Typography>Solid</Typography>
</Surface>
<Surface level="l2" variant="glass" padding={16} rounded>
  <Typography>Glass</Typography>
</Surface>`}
          title="Example: Variants"
        />
      </Section>

      <Section title="Shadow and rounded" description="Add shadow and border radius.">
        <Preview>
          <Surface level="l2" padding={16} shadow rounded>
            <Typography>With shadow</Typography>
          </Surface>
          <Surface level="l2" padding={16} shadow>
            <Typography>Shadow, no rounding</Typography>
          </Surface>
        </Preview>
        <CodeBlock
          code={`<Surface level="l2" padding={16} shadow rounded>
  <Typography>With shadow</Typography>
</Surface>
<Surface level="l2" padding={16} shadow>
  <Typography>Shadow, no rounding</Typography>
</Surface>`}
          title="Example: Shadow and rounded"
        />
      </Section>

      <Section title="Clickable" description="Surfaces can be interactive with click handlers.">
        <Preview>
          <Surface level="l1" padding={16} rounded onClick={() => alert('Clicked!')}>
            <Typography>Click me</Typography>
          </Surface>
        </Preview>
        <CodeBlock
          code={`<Surface level="l1" padding={16} rounded onClick={() => alert('Clicked!')}>
  <Typography>Click me</Typography>
</Surface>`}
          title="Example: Clickable"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Surface content' },
          { name: 'level', type: "SurfaceLevel ('l0' | 'l1' | 'l2' | 'l3')", default: "'l2'", description: 'Elevation level' },
          { name: 'variant', type: "SurfaceVariant ('solid' | 'glass')", default: "'solid'", description: 'Visual variant' },
          { name: 'rounded', type: 'boolean', default: 'false', description: 'Apply border radius' },
          { name: 'shadow', type: 'boolean', default: 'false', description: 'Apply box shadow' },
          { name: 'padding', type: 'number | string', description: 'Inner padding' },
          { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
