import { CodeInput, CodeInputType } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
export function CodeInputPage() {
  return (
    <ComponentPage
      title="CodeInput"
      description="A segmented input for entering verification codes, PINs, or OTPs. Each character gets its own input field."
    >
      <Section title="Numeric" description="Default numeric code input with 6 digits.">
        <Preview>
          <CodeInput
            onComplete={(code: string) => alert(`Code entered: ${code}`)}
          />
        </Preview>
        <CodeBlock
          code={`import { CodeInput } from '@haseen-me/ui';

<CodeInput
  onComplete={(code) => alert(\`Code entered: \${code}\`)}
  onChange={setValue}
/>`}
          title="Example: Numeric input"
        />
      </Section>

      <Section title="Alphanumeric" description="Accepts both letters and numbers.">
        <Preview>
          <CodeInput
            type={CodeInputType.ALPHANUMERIC}
            length={4}
            onComplete={(code: string) => alert(`Code: ${code}`)}
          />
        </Preview>
        <CodeBlock
          code={`import { CodeInput, CodeInputType } from '@haseen-me/ui';

<CodeInput
  type={CodeInputType.ALPHANUMERIC}
  length={4}
  onComplete={(code) => alert(\`Code: \${code}\`)}
  onChange={setValue}
/>`}
          title="Example: Alphanumeric input"
        />
      </Section>

      <Section title="Disabled" description="Code input in a disabled state.">
        <Preview>
          <CodeInput disabled />
        </Preview>
        <CodeBlock
          code={`<CodeInput disabled />`}
          title="Example: Disabled"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'length', type: 'number', default: '6', description: 'Number of input fields' },
          { name: 'type', type: 'CodeInputType', default: 'CodeInputType.NUMERIC', description: 'Input type (NUMERIC or ALPHANUMERIC)' },
          { name: 'onComplete', type: '(code: string) => void', description: 'Called when all fields are filled' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called on each input change' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all input fields' },
          { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Auto-focus the first field on mount' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
