import { Button, IconButton, Type, Size } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { Mail, ArrowRight, Plus } from 'lucide-react';

export function ButtonPage() {
  return (
    <ComponentPage
      title="Button"
      description="A clickable element that triggers actions, such as form submission or navigation. Supports multiple types, sizes, icons, and loading state."
    >
      <Section title="Types" description="Buttons come in four visual types.">
        <Preview>
          <Button type={Type.PRIMARY}>Primary</Button>
          <Button type={Type.SECONDARY}>Secondary</Button>
          <Button type={Type.TERTIARY}>Tertiary</Button>
          <Button type={Type.DESTRUCTIVE}>Destructive</Button>
        </Preview>
        <CodeBlock
          code={`import { Button, Type } from '@haseen-me/ui';

<Button type={Type.PRIMARY}>Primary</Button>
<Button type={Type.SECONDARY}>Secondary</Button>
<Button type={Type.TERTIARY}>Tertiary</Button>
<Button type={Type.DESTRUCTIVE}>Destructive</Button>`}
          title="Example: Button types"
        />
      </Section>

      <Section title="Sizes" description="Three button sizes to fit different contexts.">
        <Preview>
          <Button size={Size.SMALL}>Small</Button>
          <Button size={Size.MEDIUM}>Medium</Button>
          <Button size={Size.LARGE}>Large</Button>
        </Preview>
        <CodeBlock
          code={`import { Button, Size } from '@haseen-me/ui';

<Button size={Size.SMALL}>Small</Button>
<Button size={Size.MEDIUM}>Medium</Button>
<Button size={Size.LARGE}>Large</Button>`}
          title="Example: Button sizes"
        />
      </Section>

      <Section title="With icons" description="Add start or end icons to buttons.">
        <Preview>
          <Button startIcon={<Mail size={16} />}>Send Mail</Button>
          <Button endIcon={<ArrowRight size={16} />}>Continue</Button>
        </Preview>
        <CodeBlock
          code={`import { Button } from '@haseen-me/ui';
import { Mail, ArrowRight } from 'lucide-react';

<Button startIcon={<Mail size={16} />}>Send Mail</Button>
<Button endIcon={<ArrowRight size={16} />}>Continue</Button>`}
          title="Example: Icons"
        />
      </Section>

      <Section title="States" description="Disabled and loading states.">
        <Preview>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </Preview>
        <CodeBlock
          code={`<Button disabled>Disabled</Button>
<Button loading>Loading</Button>`}
          title="Example: States"
        />
      </Section>

      <Section title="Full width">
        <Preview>
          <div style={{ width: '100%' }}>
            <Button fullWidth>Full Width Button</Button>
          </div>
        </Preview>
      </Section>

      <Section title="IconButton" description="Square icon-only button for toolbars and compact layouts.">
        <Preview>
          <IconButton icon={<Plus size={18} />} />
          <IconButton icon={<Mail size={18} />} type={Type.SECONDARY} />
          <IconButton icon={<Plus size={18} />} size={Size.SMALL} />
          <IconButton icon={<Plus size={18} />} size={Size.LARGE} />
        </Preview>
        <CodeBlock
          code={`import { IconButton, Type, Size } from '@haseen-me/ui';
import { Plus, Mail } from 'lucide-react';

<IconButton icon={<Plus size={18} />} />
<IconButton icon={<Mail size={18} />} type={Type.SECONDARY} />
<IconButton icon={<Plus size={18} />} size={Size.SMALL} />
<IconButton icon={<Plus size={18} />} size={Size.LARGE} />`}
          title="Example: IconButton"
        />
      </Section>

      <Section title="Props">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Button</h3>
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Button label content' },
          { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler' },
          { name: 'type', type: 'Type', default: 'Type.PRIMARY', description: 'Visual variant' },
          { name: 'size', type: 'Size', default: 'Size.MEDIUM', description: 'Button size' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to fill container width' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading spinner' },
          { name: 'startIcon', type: 'ReactNode', description: 'Icon before the label' },
          { name: 'endIcon', type: 'ReactNode', description: 'Icon after the label' },
          { name: 'forceTheme', type: 'ThemeMode', description: 'Override the current theme' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
          { name: 'dataTestId', type: 'string', description: 'Test identifier' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>IconButton</h3>
        <PropsTable props={[
          { name: 'icon', type: 'ReactNode', description: 'The icon to display' },
          { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler' },
          { name: 'type', type: 'Type', default: 'Type.TERTIARY', description: 'Visual variant' },
          { name: 'size', type: 'Size', default: 'Size.MEDIUM', description: 'Button size' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
          { name: 'tooltip', type: 'string', description: 'Tooltip text on hover' },
          { name: 'forceTheme', type: 'ThemeMode', description: 'Override the current theme' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
