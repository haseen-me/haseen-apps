import { Dialog, Button, Type } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState } from 'react';

export function DialogPage() {
  const [basicOpen, setBasicOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  return (
    <ComponentPage
      title="Dialog"
      description="A modal overlay that focuses user attention on a specific task or message. Blocks interaction with the rest of the page."
    >
      <Section title="Basic dialog" description="A simple dialog with a title and description.">
        <Preview>
          <Button onClick={() => setBasicOpen(true)}>Open Dialog</Button>
          <Dialog
            open={basicOpen}
            onClose={() => setBasicOpen(false)}
            title="Basic Dialog"
            description="This is a basic dialog with a title and description."
          />
        </Preview>
        <CodeBlock
          code={`import { Dialog, Button } from '@haseen-me/ui';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Dialog</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Basic Dialog"
  description="This is a basic dialog with a title and description."
/>`}
          title="Example: Basic dialog"
        />
      </Section>

      <Section title="With actions" description="Dialog with custom action buttons.">
        <Preview>
          <Button onClick={() => setActionsOpen(true)}>Open Dialog with Actions</Button>
          <Dialog
            open={actionsOpen}
            onClose={() => setActionsOpen(false)}
            title="Confirm Action"
            description="Are you sure you want to proceed? This action cannot be undone."
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button type={Type.SECONDARY} onClick={() => setActionsOpen(false)}>Cancel</Button>
              <Button type={Type.DESTRUCTIVE} onClick={() => setActionsOpen(false)}>Delete</Button>
            </div>
          </Dialog>
        </Preview>
        <CodeBlock
          code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open Dialog</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
>
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
    <Button type={Type.SECONDARY} onClick={() => setOpen(false)}>Cancel</Button>
    <Button type={Type.DESTRUCTIVE} onClick={() => setOpen(false)}>Delete</Button>
  </div>
</Dialog>`}
          title="Example: With action buttons"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'open', type: 'boolean', description: 'Whether the dialog is visible' },
          { name: 'onClose', type: '() => void', description: 'Called when the dialog should close' },
          { name: 'title', type: 'string', description: 'Dialog title' },
          { name: 'description', type: 'string', description: 'Dialog description text' },
          { name: 'children', type: 'ReactNode', description: 'Additional dialog content' },
          { name: 'width', type: 'number', default: '420', description: 'Dialog width in pixels' },
          { name: 'actions', type: 'ReactNode', description: 'Action buttons area' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
