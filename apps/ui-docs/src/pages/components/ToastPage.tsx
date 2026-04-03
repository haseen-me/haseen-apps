import { Toast, Button } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export function ToastPage() {
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);

  return (
    <ComponentPage
      title="Toast"
      description="A brief, non-intrusive notification that appears temporarily to confirm an action or display a short message."
    >
      <Section title="Basic toast" description="A simple toast triggered by a button.">
        <Preview>
          <Button onClick={() => setVisible1(true)}>Show Toast</Button>
          <Toast
            message="Changes saved successfully"
            visible={visible1}
            onDismiss={() => setVisible1(false)}
          />
        </Preview>
        <CodeBlock
          code={`import { Toast, Button } from '@haseen-me/ui';
import { useState } from 'react';

const [visible, setVisible] = useState(false);

<Button onClick={() => setVisible(true)}>Show Toast</Button>
<Toast
  message="Changes saved successfully"
  visible={visible}
  onDismiss={() => setVisible(false)}
/>`}
          title="Example: Basic toast"
        />
      </Section>

      <Section title="With action and icon" description="Toast with an icon and action button.">
        <Preview>
          <Button onClick={() => setVisible2(true)}>Show Toast with Action</Button>
          <Toast
            message="Email sent"
            visible={visible2}
            onDismiss={() => setVisible2(false)}
            icon={<CheckCircle size={16} />}
            action={{ label: 'Undo', onClick: () => setVisible2(false) }}
          />
        </Preview>
        <CodeBlock
          code={`import { Toast } from '@haseen-me/ui';
import { CheckCircle } from 'lucide-react';

<Toast
  message="Email sent"
  visible={visible}
  onDismiss={() => setVisible(false)}
  icon={<CheckCircle size={16} />}
  action={{ label: 'Undo', onClick: () => setVisible(false) }}
/>`}
          title="Example: With action and icon"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'message', type: 'string', description: 'Toast message text' },
          { name: 'visible', type: 'boolean', description: 'Whether the toast is visible' },
          { name: 'onDismiss', type: '() => void', description: 'Called when the toast dismisses' },
          { name: 'duration', type: 'number', default: '4000', description: 'Auto-dismiss duration in ms' },
          { name: 'action', type: '{ label: string; onClick: () => void }', description: 'Optional action button' },
          { name: 'icon', type: 'ReactNode', description: 'Icon displayed before the message' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
