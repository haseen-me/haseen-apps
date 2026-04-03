import { IconText, IconTextSize } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { Mail, ArrowRight, Star } from 'lucide-react';

export function IconTextPage() {
  return (
    <ComponentPage
      title="IconText"
      description="A compact combination of an icon and label text, commonly used in navigation items, list entries, and metadata."
    >
      <Section title="Default" description="Basic icon-text pairings with a start icon.">
        <Preview>
          <IconText label="Inbox" icon={<Mail size={16} />} />
          <IconText label="Starred" icon={<Star size={16} />} />
        </Preview>
        <CodeBlock
          code={`import { IconText } from '@haseen-me/ui';
import { Mail, Star } from 'lucide-react';

<IconText label="Inbox" icon={<Mail size={16} />} />
<IconText label="Starred" icon={<Star size={16} />} />`}
          title="Example: Default"
        />
      </Section>

      <Section title="Sizes" description="Three size options for different contexts.">
        <Preview>
          <IconText label="Small" icon={<Mail size={14} />} size={IconTextSize.SMALL} />
          <IconText label="Medium" icon={<Mail size={16} />} size={IconTextSize.MEDIUM} />
          <IconText label="Large" icon={<Mail size={18} />} size={IconTextSize.LARGE} />
        </Preview>
        <CodeBlock
          code={`import { IconText, IconTextSize } from '@haseen-me/ui';
import { Mail } from 'lucide-react';

<IconText label="Small" icon={<Mail size={14} />} size={IconTextSize.SMALL} />
<IconText label="Medium" icon={<Mail size={16} />} size={IconTextSize.MEDIUM} />
<IconText label="Large" icon={<Mail size={18} />} size={IconTextSize.LARGE} />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="With end icon" description="Add a trailing icon.">
        <Preview>
          <IconText label="Continue" icon={<Mail size={16} />} endIcon={<ArrowRight size={14} />} />
        </Preview>
        <CodeBlock
          code={`import { ArrowRight, Mail } from 'lucide-react';

<IconText label="Continue" icon={<Mail size={16} />} endIcon={<ArrowRight size={14} />} />`}
          title="Example: End icon"
        />
      </Section>

      <Section title="Clickable" description="Icon text with click interaction.">
        <Preview>
          <IconText label="Click me" icon={<Mail size={16} />} onClick={() => alert('Clicked!')} />
        </Preview>
        <CodeBlock
          code={`<IconText label="Click me" icon={<Mail size={16} />} onClick={() => alert('Clicked!')} />`}
          title="Example: Clickable"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'label', type: 'string', description: 'Text label' },
          { name: 'icon', type: 'ReactNode', description: 'Start icon element' },
          { name: 'endIcon', type: 'ReactNode', description: 'End icon element' },
          { name: 'size', type: 'IconTextSize', default: 'IconTextSize.MEDIUM', description: 'Component size' },
          { name: 'color', type: 'string', description: 'Text color override' },
          { name: 'weight', type: 'number', description: 'Font weight override' },
          { name: 'onClick', type: '() => void', description: 'Click handler' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
