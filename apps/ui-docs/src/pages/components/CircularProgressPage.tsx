import { CircularProgress, CircularProgressSize } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function CircularProgressPage() {
  return (
    <ComponentPage
      title="CircularProgress"
      description="An indeterminate loading spinner used to indicate that an operation is in progress."
    >
      <Section title="Default" description="A standard circular progress indicator.">
        <Preview>
          <CircularProgress />
        </Preview>
        <CodeBlock
          code={`import { CircularProgress } from '@haseen-me/ui';

<CircularProgress />`}
          title="Example: Default"
        />
      </Section>

      <Section title="Sizes" description="Predefined sizes for different contexts.">
        <Preview>
          <CircularProgress size={CircularProgressSize.SMALL} />
          <CircularProgress size={CircularProgressSize.MEDIUM} />
          <CircularProgress size={CircularProgressSize.LARGE} />
        </Preview>
        <CodeBlock
          code={`import { CircularProgress, CircularProgressSize } from '@haseen-me/ui';

<CircularProgress size={CircularProgressSize.SMALL} />
<CircularProgress size={CircularProgressSize.MEDIUM} />
<CircularProgress size={CircularProgressSize.LARGE} />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="Custom" description="Custom color and thickness.">
        <Preview>
          <CircularProgress color="#E53E3E" thickness={4} />
          <CircularProgress color="#3182CE" thickness={2} size={48} />
          <CircularProgress color="#38A169" thickness={6} size={32} />
        </Preview>
        <CodeBlock
          code={`<CircularProgress color="#E53E3E" thickness={4} />
<CircularProgress color="#3182CE" thickness={2} size={48} />
<CircularProgress color="#38A169" thickness={6} size={32} />`}
          title="Example: Custom color and thickness"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'size', type: 'CircularProgressSize | number', default: 'CircularProgressSize.MEDIUM', description: 'Spinner size' },
          { name: 'color', type: 'string', description: 'Spinner color' },
          { name: 'thickness', type: 'number', description: 'Stroke thickness' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
