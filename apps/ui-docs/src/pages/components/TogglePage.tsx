import { Toggle } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState } from 'react';

export function TogglePage() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);

  return (
    <ComponentPage
      title="Toggle"
      description="A binary switch control for enabling or disabling a setting, similar to a physical on/off switch."
    >
      <Section title="Default" description="Toggle between checked and unchecked states.">
        <Preview>
          <Toggle checked={checked1} onChange={setChecked1} />
          <Toggle checked={checked2} onChange={setChecked2} />
        </Preview>
        <CodeBlock
          code={`import { Toggle } from '@haseen-me/ui';
import { useState } from 'react';

const [checked, setChecked] = useState(false);

<Toggle checked={checked} onChange={setChecked} />`}
          title="Example: Default toggle"
        />
      </Section>

      <Section title="Sizes" description="Toggles in small and medium sizes.">
        <Preview>
          <Toggle checked={checked1} onChange={setChecked1} size="small" />
          <Toggle checked={checked1} onChange={setChecked1} size="medium" />
        </Preview>
        <CodeBlock
          code={`<Toggle checked={checked} onChange={setChecked} size="small" />
<Toggle checked={checked} onChange={setChecked} size="medium" />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="Disabled" description="A toggle that cannot be interacted with.">
        <Preview>
          <Toggle checked={false} onChange={() => {}} disabled />
          <Toggle checked={true} onChange={() => {}} disabled />
        </Preview>
        <CodeBlock
          code={`<Toggle checked={false} onChange={() => {}} disabled />
<Toggle checked={true} onChange={() => {}} disabled />`}
          title="Example: Disabled"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'checked', type: 'boolean', description: 'Whether the toggle is on' },
          { name: 'onChange', type: '(checked: boolean) => void', description: 'Called when the toggle state changes' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
          { name: 'size', type: "'small' | 'medium'", default: "'medium'", description: 'Toggle size' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
