import { Tabs, TabsSize } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState } from 'react';

export function TabsPage() {
  const [activeTab, setActiveTab] = useState('tab1');
  const [activeTab2, setActiveTab2] = useState('tab1');
  const [activeTab3, setActiveTab3] = useState('tab1');

  const tabs = [
    { id: 'tab1', label: 'General' },
    { id: 'tab2', label: 'Security' },
    { id: 'tab3', label: 'Notifications' },
  ];

  return (
    <ComponentPage
      title="Tabs"
      description="A horizontal navigation element for switching between related views or content panels within the same context."
    >
      <Section title="Default" description="A basic tab bar with three tabs.">
        <Preview>
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </Preview>
        <CodeBlock
          code={`import { Tabs } from '@haseen-me/ui';
import { useState } from 'react';

const [activeTab, setActiveTab] = useState('tab1');

const tabs = [
  { id: 'tab1', label: 'General' },
  { id: 'tab2', label: 'Security' },
  { id: 'tab3', label: 'Notifications' },
];

<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />`}
          title="Example: Default tabs"
        />
      </Section>

      <Section title="Sizes" description="Tabs come in small and medium sizes.">
        <Preview>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            <Tabs tabs={tabs} activeTab={activeTab2} onTabChange={setActiveTab2} size={TabsSize.SMALL} />
            <Tabs tabs={tabs} activeTab={activeTab2} onTabChange={setActiveTab2} size={TabsSize.MEDIUM} />
          </div>
        </Preview>
        <CodeBlock
          code={`import { Tabs, TabsSize } from '@haseen-me/ui';

<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} size={TabsSize.SMALL} />
<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} size={TabsSize.MEDIUM} />`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="Full width" description="Tabs stretch to fill their container.">
        <Preview>
          <div style={{ width: '100%' }}>
            <Tabs tabs={tabs} activeTab={activeTab3} onTabChange={setActiveTab3} fullWidth />
          </div>
        </Preview>
        <CodeBlock
          code={`<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} fullWidth />`}
          title="Example: Full width"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'tabs', type: 'Tab[]', description: 'Array of { id, label } tab definitions' },
          { name: 'activeTab', type: 'string', description: 'ID of the currently active tab' },
          { name: 'onTabChange', type: '(tabId: string) => void', description: 'Called when the active tab changes' },
          { name: 'size', type: 'TabsSize', default: 'TabsSize.MEDIUM', description: 'Tab size' },
          { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch tabs to fill container' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
