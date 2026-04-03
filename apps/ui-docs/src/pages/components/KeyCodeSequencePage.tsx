import { KeyCodeSequence } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function KeyCodeSequencePage() {
  return (
    <ComponentPage
      title="KeyCodeSequence"
      description="Displays keyboard shortcut key combinations as styled key caps, ideal for showing hotkeys and keyboard shortcuts."
    >
      <Section title="Default" description="Common keyboard shortcuts displayed as key sequences.">
        <Preview>
          <KeyCodeSequence keys={['⌘', 'K']} />
          <KeyCodeSequence keys={['Ctrl', 'Shift', 'P']} />
          <KeyCodeSequence keys={['⌘', 'S']} />
        </Preview>
        <CodeBlock
          code={`import { KeyCodeSequence } from '@haseen-me/ui';

<KeyCodeSequence keys={['⌘', 'K']} />
<KeyCodeSequence keys={['Ctrl', 'Shift', 'P']} />
<KeyCodeSequence keys={['⌘', 'S']} />`}
          title="Example: Key sequences"
        />
      </Section>

      <Section title="Single keys" description="Individual keys displayed alone.">
        <Preview>
          <KeyCodeSequence keys={['Esc']} />
          <KeyCodeSequence keys={['Enter']} />
          <KeyCodeSequence keys={['Tab']} />
          <KeyCodeSequence keys={['Space']} />
        </Preview>
        <CodeBlock
          code={`<KeyCodeSequence keys={['Esc']} />
<KeyCodeSequence keys={['Enter']} />
<KeyCodeSequence keys={['Tab']} />
<KeyCodeSequence keys={['Space']} />`}
          title="Example: Single keys"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'keys', type: 'string[]', description: 'Array of key labels to display' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
