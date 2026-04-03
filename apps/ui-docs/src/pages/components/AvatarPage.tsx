import { Avatar, Size } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { User } from 'lucide-react';

export function AvatarPage() {
  return (
    <ComponentPage
      title="Avatar"
      description="A graphical representation of a user or entity, often an image or initials displayed in a circular container."
    >
      <Section title="Sizes" description="Avatars support all standard sizes.">
        <Preview>
          <Avatar label="Alice" size={Size.SMALL} />
          <Avatar label="Bob" size={Size.MEDIUM} />
          <Avatar label="Charlie" size={Size.LARGE} />
          <Avatar label="Diana" size={Size.X_LARGE} />
        </Preview>
        <CodeBlock
          code={`import { Avatar, Size } from '@haseen-me/ui';

<Avatar label="Alice" size={Size.SMALL} />
<Avatar label="Bob" size={Size.MEDIUM} />
<Avatar label="Charlie" size={Size.LARGE} />
<Avatar label="Diana" size={Size.X_LARGE} />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="With icon" description="Use a custom icon instead of initials.">
        <Preview>
          <Avatar icon={<User size={20} />} size={Size.MEDIUM} />
          <Avatar icon={<User size={24} />} size={Size.LARGE} />
        </Preview>
        <CodeBlock
          code={`import { Avatar, Size } from '@haseen-me/ui';
import { User } from 'lucide-react';

<Avatar icon={<User size={20} />} size={Size.MEDIUM} />
<Avatar icon={<User size={24} />} size={Size.LARGE} />`}
          title="Example: Icon avatar"
        />
      </Section>

      <Section title="Custom color">
        <Preview>
          <Avatar label="Red" color="#E53E3E" />
          <Avatar label="Blue" color="#3182CE" />
          <Avatar label="Green" color="#38A169" />
          <Avatar label="Teal" color="#2db8af" />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'label', type: 'string', description: 'Text to derive initials from' },
          { name: 'imageSrc', type: 'string', description: 'Image URL for the avatar' },
          { name: 'icon', type: 'ReactNode', description: 'Custom icon element' },
          { name: 'size', type: 'Size', default: 'Size.MEDIUM', description: 'Avatar size' },
          { name: 'color', type: 'string', description: 'Background color override' },
          { name: 'onClick', type: '(e: MouseEvent) => void', description: 'Click handler' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
