import { Chip, ChipSize } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { Reply } from 'lucide-react';

export function ChipPage() {
  return (
    <ComponentPage
      title="Chip"
      description="A compact element used to display tags, filters, or selectable options. Supports icons, active state, and deletion."
    >
      <Section title="Default" description="Basic chip usage with a label.">
        <Preview>
          <Chip label="Default" />
          <Chip label="With icon" icon={<Reply size={14} />} />
          <Chip label="Active" active />
        </Preview>
        <CodeBlock
          code={`import { Chip } from '@haseen-me/ui';
import { Reply } from 'lucide-react';

<Chip label="Default" />
<Chip label="With icon" icon={<Reply size={14} />} />
<Chip label="Active" active />`}
          title="Example: Default chips"
        />
      </Section>

      <Section title="Sizes" description="Chips come in small and medium sizes.">
        <Preview>
          <Chip label="Small" size={ChipSize.SMALL} />
          <Chip label="Medium" size={ChipSize.MEDIUM} />
        </Preview>
        <CodeBlock
          code={`import { Chip, ChipSize } from '@haseen-me/ui';

<Chip label="Small" size={ChipSize.SMALL} />
<Chip label="Medium" size={ChipSize.MEDIUM} />`}
          title="Example: Chip sizes"
        />
      </Section>

      <Section title="Deletable" description="Chips can include a delete action.">
        <Preview>
          <Chip label="Deletable" onDelete={() => alert('Deleted!')} />
          <Chip label="Active deletable" active onDelete={() => alert('Deleted!')} />
        </Preview>
        <CodeBlock
          code={`<Chip label="Deletable" onDelete={() => alert('Deleted!')} />
<Chip label="Active deletable" active onDelete={() => alert('Deleted!')} />`}
          title="Example: Deletable chips"
        />
      </Section>

      <Section title="Clickable" description="Chips can be interactive with an onClick handler.">
        <Preview>
          <Chip label="Click me" onClick={() => alert('Clicked!')} />
          <Chip label="With icon" icon={<Reply size={14} />} onClick={() => alert('Clicked!')} />
        </Preview>
        <CodeBlock
          code={`<Chip label="Click me" onClick={() => alert('Clicked!')} />
<Chip label="With icon" icon={<Reply size={14} />} onClick={() => alert('Clicked!')} />`}
          title="Example: Clickable chips"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'label', type: 'string', description: 'Chip text content' },
          { name: 'size', type: 'ChipSize', default: 'ChipSize.MEDIUM', description: 'Chip size' },
          { name: 'icon', type: 'ReactNode', description: 'Icon before the label' },
          { name: 'endIcon', type: 'ReactNode', description: 'Icon after the label' },
          { name: 'active', type: 'boolean', default: 'false', description: 'Active/selected state' },
          { name: 'onClick', type: '() => void', description: 'Click handler' },
          { name: 'onDelete', type: '() => void', description: 'Delete handler, shows delete icon' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
