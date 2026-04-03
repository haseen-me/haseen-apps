import type React from 'react';
import { InputField, Input, InputFieldSize, InputType, TextArea, SubText } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { Search, Eye } from 'lucide-react';
import { useState } from 'react';

export function InputFieldPage() {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');

  return (
    <ComponentPage
      title="InputField"
      description="Form input components for collecting user text, including single-line inputs, password fields, and multi-line text areas."
    >
      <Section title="Basic input" description="A simple text input with placeholder.">
        <Preview>
          <div style={{ width: 320 }}>
            <InputField>
              <Input placeholder="Enter your name" value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} />
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { InputField, Input } from '@haseen-me/ui';

<InputField>
  <Input placeholder="Enter your name" value={text} onChange={(e) => setText(e.target.value)} />
</InputField>`}
          title="Example: Basic input"
        />
      </Section>

      <Section title="Sizes" description="Input fields come in three sizes.">
        <Preview>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
            <InputField size={InputFieldSize.SMALL}>
              <Input placeholder="Small" />
            </InputField>
            <InputField size={InputFieldSize.MEDIUM}>
              <Input placeholder="Medium" />
            </InputField>
            <InputField size={InputFieldSize.LARGE}>
              <Input placeholder="Large" />
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { InputField, Input, InputFieldSize } from '@haseen-me/ui';

<InputField size={InputFieldSize.SMALL}>
  <Input placeholder="Small" />
</InputField>
<InputField size={InputFieldSize.MEDIUM}>
  <Input placeholder="Medium" />
</InputField>
<InputField size={InputFieldSize.LARGE}>
  <Input placeholder="Large" />
</InputField>`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="With icons" description="Add icons at the start or end of the input.">
        <Preview>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
            <InputField startIcon={<Search size={16} />}>
              <Input placeholder="Search..." />
            </InputField>
            <InputField endIcon={<Eye size={16} />}>
              <Input placeholder="With end icon" />
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { InputField, Input } from '@haseen-me/ui';
import { Search, Eye } from 'lucide-react';

<InputField startIcon={<Search size={16} />}>
  <Input placeholder="Search..." />
</InputField>
<InputField endIcon={<Eye size={16} />}>
  <Input placeholder="With end icon" />
</InputField>`}
          title="Example: With icons"
        />
      </Section>

      <Section title="Password" description="Password input type hides the entered text.">
        <Preview>
          <div style={{ width: 320 }}>
            <InputField>
              <Input
                type={InputType.PASSWORD}
                placeholder="Enter password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Input, InputType } from '@haseen-me/ui';

<Input type={InputType.PASSWORD} placeholder="Enter password" />`}
          title="Example: Password input"
        />
      </Section>

      <Section title="Error state" description="Display validation errors with SubText.">
        <Preview>
          <div style={{ width: 320 }}>
            <InputField error>
              <Input placeholder="Invalid email" value="not-an-email" />
              <SubText>Please enter a valid email address</SubText>
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { InputField, Input, SubText } from '@haseen-me/ui';

<InputField error>
  <Input placeholder="Invalid email" value="not-an-email" />
  <SubText>Please enter a valid email address</SubText>
</InputField>`}
          title="Example: Error state"
        />
      </Section>

      <Section title="TextArea" description="Multi-line text input.">
        <Preview>
          <div style={{ width: 320 }}>
            <InputField>
              <TextArea placeholder="Write a message..." rows={4} />
            </InputField>
          </div>
        </Preview>
        <CodeBlock
          code={`import { InputField, TextArea } from '@haseen-me/ui';

<InputField>
  <TextArea placeholder="Write a message..." rows={4} />
</InputField>`}
          title="Example: TextArea"
        />
      </Section>

      <Section title="Props">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>InputField</h3>
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Input or TextArea child' },
          { name: 'size', type: 'InputFieldSize', default: 'InputFieldSize.MEDIUM', description: 'Field size' },
          { name: 'startIcon', type: 'ReactNode', description: 'Icon at the start' },
          { name: 'endIcon', type: 'ReactNode', description: 'Icon at the end' },
          { name: 'error', type: 'boolean', default: 'false', description: 'Error state styling' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the field' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>Input</h3>
        <PropsTable props={[
          { name: 'placeholder', type: 'string', description: 'Placeholder text' },
          { name: 'value', type: 'string', description: 'Input value' },
          { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler' },
          { name: 'type', type: 'InputType', default: 'InputType.TEXT', description: 'Input type (TEXT, PASSWORD)' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' },
          { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Auto-focus on mount' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>TextArea</h3>
        <PropsTable props={[
          { name: 'placeholder', type: 'string', description: 'Placeholder text' },
          { name: 'value', type: 'string', description: 'TextArea value' },
          { name: 'onChange', type: '(e: ChangeEvent) => void', description: 'Change handler' },
          { name: 'rows', type: 'number', description: 'Number of visible rows' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the textarea' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>SubText</h3>
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Helper or error message text' },
          { name: 'variant', type: "'default' | 'error'", description: 'Text color variant (auto-set by InputField error prop)' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
