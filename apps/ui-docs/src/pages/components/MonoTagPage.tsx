import { MonoTag } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function MonoTagPage() {
  return (
    <ComponentPage
      title="MonoTag"
      description="A small monospaced label used to highlight code-related text, version numbers, or technical identifiers."
    >
      <Section title="Default" description="Basic monospace tags.">
        <Preview>
          <MonoTag>v1.0.0</MonoTag>
          <MonoTag>GET</MonoTag>
          <MonoTag>200 OK</MonoTag>
          <MonoTag>string</MonoTag>
        </Preview>
        <CodeBlock
          code={`import { MonoTag } from '@haseen-me/ui';

<MonoTag>v1.0.0</MonoTag>
<MonoTag>GET</MonoTag>
<MonoTag>200 OK</MonoTag>
<MonoTag>string</MonoTag>`}
          title="Example: Default"
        />
      </Section>

      <Section title="Custom colors" description="Override colors for contextual styling.">
        <Preview>
          <MonoTag color="#E53E3E" bgColor="#FED7D7">DELETE</MonoTag>
          <MonoTag color="#38A169" bgColor="#C6F6D5">POST</MonoTag>
          <MonoTag color="#3182CE" bgColor="#BEE3F8">GET</MonoTag>
          <MonoTag color="#D69E2E" bgColor="#FEFCBF">PATCH</MonoTag>
        </Preview>
        <CodeBlock
          code={`<MonoTag color="#E53E3E" bgColor="#FED7D7">DELETE</MonoTag>
<MonoTag color="#38A169" bgColor="#C6F6D5">POST</MonoTag>
<MonoTag color="#3182CE" bgColor="#BEE3F8">GET</MonoTag>
<MonoTag color="#D69E2E" bgColor="#FEFCBF">PATCH</MonoTag>`}
          title="Example: Custom colors"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Tag content' },
          { name: 'color', type: 'string', description: 'Text color' },
          { name: 'bgColor', type: 'string', description: 'Background color' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
