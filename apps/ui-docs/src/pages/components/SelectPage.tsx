import { Select } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState } from 'react';

export function SelectPage() {
  const [fruit, setFruit] = useState('apple');
  const [priority, setPriority] = useState('');

  const fruitOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'grape', label: 'Grape' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <ComponentPage
      title="Select"
      description="A dropdown selector for choosing a single value from a list of predefined options."
    >
      <Section title="Basic" description="A simple select with options.">
        <Preview>
          <Select
            options={fruitOptions}
            value={fruit}
            onChange={setFruit}
          />
        </Preview>
        <CodeBlock
          code={`import { Select } from '@haseen-me/ui';
import { useState } from 'react';

const [value, setValue] = useState('apple');

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
];

<Select options={options} value={value} onChange={setValue} />`}
          title="Example: Basic select"
        />
      </Section>

      <Section title="With placeholder" description="Show a placeholder when no value is selected.">
        <Preview>
          <Select
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            placeholder="Select priority..."
          />
        </Preview>
        <CodeBlock
          code={`<Select
  options={priorityOptions}
  value={value}
  onChange={setValue}
  placeholder="Select priority..."
/>`}
          title="Example: With placeholder"
        />
      </Section>

      <Section title="Disabled" description="A disabled select that cannot be interacted with.">
        <Preview>
          <Select
            options={fruitOptions}
            value="apple"
            onChange={() => {}}
            disabled
          />
        </Preview>
        <CodeBlock
          code={`<Select options={options} value="apple" onChange={() => {}} disabled />`}
          title="Example: Disabled"
        />
      </Section>

      <Section title="Custom width" description="Control the width of the select.">
        <Preview>
          <Select
            options={fruitOptions}
            value={fruit}
            onChange={setFruit}
            width={300}
          />
        </Preview>
        <CodeBlock
          code={`<Select options={options} value={value} onChange={setValue} width={300} />`}
          title="Example: Custom width"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'options', type: 'SelectOption[]', description: 'Array of { value, label, icon? } options' },
          { name: 'value', type: 'string', description: 'Currently selected value' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called when selection changes' },
          { name: 'placeholder', type: 'string', description: 'Placeholder text when no value selected' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
          { name: 'width', type: 'number', description: 'Custom width in pixels' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
