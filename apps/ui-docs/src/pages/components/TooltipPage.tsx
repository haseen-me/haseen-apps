import { Tooltip, TooltipPlacement, Button, Type } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function TooltipPage() {
  return (
    <ComponentPage
      title="Tooltip"
      description="A small popup that provides additional context or a label when hovering over or focusing on an element."
    >
      <Section title="Placements" description="Tooltips can appear in four positions relative to the trigger.">
        <Preview>
          <Tooltip content="Top tooltip" placement={TooltipPlacement.TOP}>
            <Button type={Type.SECONDARY}>Top</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" placement={TooltipPlacement.BOTTOM}>
            <Button type={Type.SECONDARY}>Bottom</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" placement={TooltipPlacement.LEFT}>
            <Button type={Type.SECONDARY}>Left</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" placement={TooltipPlacement.RIGHT}>
            <Button type={Type.SECONDARY}>Right</Button>
          </Tooltip>
        </Preview>
        <CodeBlock
          code={`import { Tooltip, TooltipPlacement, Button } from '@haseen-me/ui';

<Tooltip content="Top tooltip" placement={TooltipPlacement.TOP}>
  <Button>Top</Button>
</Tooltip>
<Tooltip content="Bottom tooltip" placement={TooltipPlacement.BOTTOM}>
  <Button>Bottom</Button>
</Tooltip>
<Tooltip content="Left tooltip" placement={TooltipPlacement.LEFT}>
  <Button>Left</Button>
</Tooltip>
<Tooltip content="Right tooltip" placement={TooltipPlacement.RIGHT}>
  <Button>Right</Button>
</Tooltip>`}
          title="Example: Placements"
        />
      </Section>

      <Section title="Default" description="Tooltip wrapping any element.">
        <Preview>
          <Tooltip content="This is a helpful tooltip">
            <span style={{ textDecoration: 'underline', cursor: 'help' }}>Hover over me</span>
          </Tooltip>
        </Preview>
        <CodeBlock
          code={`<Tooltip content="This is a helpful tooltip">
  <span style={{ textDecoration: 'underline', cursor: 'help' }}>Hover over me</span>
</Tooltip>`}
          title="Example: Default tooltip"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'The element to attach the tooltip to' },
          { name: 'content', type: 'ReactNode', description: 'Tooltip content' },
          { name: 'placement', type: 'TooltipPlacement', default: 'TooltipPlacement.TOP', description: 'Tooltip position relative to trigger' },
          { name: 'delay', type: 'number', default: '200', description: 'Delay before showing in ms' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
