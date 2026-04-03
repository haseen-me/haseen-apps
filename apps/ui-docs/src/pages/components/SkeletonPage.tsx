import { Skeleton } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function SkeletonPage() {
  return (
    <ComponentPage
      title="Skeleton"
      description="A placeholder loading animation that mimics the shape of content before it loads, reducing perceived loading time."
    >
      <Section title="Default" description="A default skeleton with standard dimensions.">
        <Preview>
          <Skeleton />
        </Preview>
        <CodeBlock
          code={`import { Skeleton } from '@haseen-me/ui';

<Skeleton />`}
          title="Example: Default"
        />
      </Section>

      <Section title="Custom dimensions" description="Customize width and height for different content shapes.">
        <Preview>
          <Skeleton width={200} height={16} />
          <Skeleton width={300} height={16} />
          <Skeleton width={150} height={16} />
        </Preview>
        <CodeBlock
          code={`<Skeleton width={200} height={16} />
<Skeleton width={300} height={16} />
<Skeleton width={150} height={16} />`}
          title="Example: Custom dimensions"
        />
      </Section>

      <Section title="Custom shapes" description="Use borderRadius to create different shapes.">
        <Preview>
          <Skeleton width={48} height={48} borderRadius="50%" />
          <Skeleton width={200} height={24} borderRadius={4} />
          <Skeleton width={120} height={120} borderRadius={12} />
        </Preview>
        <CodeBlock
          code={`<Skeleton width={48} height={48} borderRadius="50%" />
<Skeleton width={200} height={24} borderRadius={4} />
<Skeleton width={120} height={120} borderRadius={12} />`}
          title="Example: Custom shapes"
        />
      </Section>

      <Section title="Content placeholder" description="Composing skeletons to mimic a content card.">
        <Preview>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Skeleton width={40} height={40} borderRadius="50%" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width={160} height={14} />
              <Skeleton width={240} height={12} />
              <Skeleton width={200} height={12} />
            </div>
          </div>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'width', type: 'number | string', description: 'Skeleton width' },
          { name: 'height', type: 'number | string', description: 'Skeleton height' },
          { name: 'borderRadius', type: 'number | string', description: 'Border radius for shape control' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
