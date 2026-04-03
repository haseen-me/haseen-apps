import { Facepile, Avatar, Size } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function FacepilePage() {
  const avatars = [
    <Avatar label="Alice" key="a" />,
    <Avatar label="Bob" key="b" />,
    <Avatar label="Charlie" key="c" />,
    <Avatar label="Diana" key="d" />,
    <Avatar label="Edward" key="e" />,
  ];

  return (
    <ComponentPage
      title="Facepile"
      description="A compact stack of overlapping avatars representing a group of users, with an overflow indicator when the count exceeds the max."
    >
      <Section title="Default" description="Facepile with multiple avatars.">
        <Preview>
          <Facepile avatars={avatars} />
        </Preview>
        <CodeBlock
          code={`import { Facepile, Avatar } from '@haseen-me/ui';

const avatars = [
  <Avatar label="Alice" key="a" />,
  <Avatar label="Bob" key="b" />,
  <Avatar label="Charlie" key="c" />,
  <Avatar label="Diana" key="d" />,
  <Avatar label="Edward" key="e" />,
];

<Facepile avatars={avatars} />`}
          title="Example: Default facepile"
        />
      </Section>

      <Section title="Custom max" description="Control how many avatars display before the overflow count.">
        <Preview>
          <Facepile avatars={avatars} max={2} />
          <Facepile avatars={avatars} max={3} />
          <Facepile avatars={avatars} max={5} />
        </Preview>
        <CodeBlock
          code={`<Facepile avatars={avatars} max={2} />
<Facepile avatars={avatars} max={3} />
<Facepile avatars={avatars} max={5} />`}
          title="Example: Custom max"
        />
      </Section>

      <Section title="Sizes" description="Facepile respects avatar sizes.">
        <Preview>
          <Facepile avatars={avatars} size={Size.SMALL} />
          <Facepile avatars={avatars} size={Size.MEDIUM} />
          <Facepile avatars={avatars} size={Size.LARGE} />
        </Preview>
        <CodeBlock
          code={`import { Facepile, Size } from '@haseen-me/ui';

<Facepile avatars={avatars} size={Size.SMALL} />
<Facepile avatars={avatars} size={Size.MEDIUM} />
<Facepile avatars={avatars} size={Size.LARGE} />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'avatars', type: 'ReactNode[]', description: 'Array of Avatar elements to display' },
          { name: 'max', type: 'number', default: '4', description: 'Maximum number of avatars to show' },
          { name: 'size', type: 'Size', default: 'Size.MEDIUM', description: 'Size of the avatars' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
