import { Dropdown, DropdownItem, DropdownItemColor, DropdownSubmenu, Button, Type } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { useState, useRef } from 'react';
import { Trash2, Edit, Copy, Share } from 'lucide-react';

export function DropdownPage() {
  const [open, setOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const submenuButtonRef = useRef<HTMLDivElement>(null);

  return (
    <ComponentPage
      title="Dropdown"
      description="A floating menu that appears on trigger, containing a list of actions or options. Supports icons, colors, and nested submenus."
    >
      <Section title="Basic dropdown" description="A dropdown with simple items.">
        <Preview>
          <div ref={buttonRef}>
            <Button onClick={() => setOpen(!open)} type={Type.SECONDARY}>Open Dropdown</Button>
          </div>
          <Dropdown open={open} onClose={() => setOpen(false)} callerRef={buttonRef}>
            <DropdownItem label="Edit" icon={<Edit size={14} />} onClick={() => setOpen(false)} />
            <DropdownItem label="Copy" icon={<Copy size={14} />} onClick={() => setOpen(false)} />
            <DropdownItem label="Share" icon={<Share size={14} />} onClick={() => setOpen(false)} />
            <DropdownItem
              label="Delete"
              icon={<Trash2 size={14} />}
              color={DropdownItemColor.DESTRUCTIVE}
              onClick={() => setOpen(false)}
            />
          </Dropdown>
        </Preview>
        <CodeBlock
          code={`import { Dropdown, DropdownItem, DropdownItemColor, Button } from '@haseen-me/ui';
import { useState, useRef } from 'react';
import { Edit, Copy, Share, Trash2 } from 'lucide-react';

const [open, setOpen] = useState(false);
const buttonRef = useRef<HTMLDivElement>(null);

<div ref={buttonRef}>
  <Button onClick={() => setOpen(!open)}>Open Dropdown</Button>
</div>
<Dropdown open={open} onClose={() => setOpen(false)} callerRef={buttonRef}>
  <DropdownItem label="Edit" icon={<Edit size={14} />} />
  <DropdownItem label="Copy" icon={<Copy size={14} />} />
  <DropdownItem label="Share" icon={<Share size={14} />} />
  <DropdownItem
    label="Delete"
    icon={<Trash2 size={14} />}
    color={DropdownItemColor.DESTRUCTIVE}
  />
</Dropdown>`}
          title="Example: Basic dropdown"
        />
      </Section>

      <Section title="Item colors" description="Dropdown items support color variants.">
        <Preview>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 0', border: '1px solid var(--docs-border)', borderRadius: 8, minWidth: 200 }}>
            <DropdownItem label="Default item" />
            <DropdownItem label="Destructive item" color={DropdownItemColor.DESTRUCTIVE} />
          </div>
        </Preview>
        <CodeBlock
          code={`import { DropdownItem, DropdownItemColor } from '@haseen-me/ui';

<DropdownItem label="Default item" />
<DropdownItem label="Destructive item" color={DropdownItemColor.DESTRUCTIVE} />`}
          title="Example: Item colors"
        />
      </Section>

      <Section title="With submenu" description="Nested dropdown menus for hierarchical actions.">
        <Preview>
          <div ref={submenuButtonRef}>
            <Button onClick={() => setSubmenuOpen(!submenuOpen)} type={Type.SECONDARY}>Dropdown with Submenu</Button>
          </div>
          <Dropdown open={submenuOpen} onClose={() => setSubmenuOpen(false)} callerRef={submenuButtonRef}>
            <DropdownItem label="Action 1" onClick={() => setSubmenuOpen(false)} />
            <DropdownSubmenu label="More options">
              <DropdownItem label="Sub-action A" onClick={() => setSubmenuOpen(false)} />
              <DropdownItem label="Sub-action B" onClick={() => setSubmenuOpen(false)} />
            </DropdownSubmenu>
          </Dropdown>
        </Preview>
        <CodeBlock
          code={`import { Dropdown, DropdownItem, DropdownSubmenu } from '@haseen-me/ui';

<Dropdown open={open} onClose={() => setOpen(false)} callerRef={buttonRef}>
  <DropdownItem label="Action 1" />
  <DropdownSubmenu label="More options">
    <DropdownItem label="Sub-action A" />
    <DropdownItem label="Sub-action B" />
  </DropdownSubmenu>
</Dropdown>`}
          title="Example: With submenu"
        />
      </Section>

      <Section title="Props">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Dropdown</h3>
        <PropsTable props={[
          { name: 'open', type: 'boolean', description: 'Whether the dropdown is visible' },
          { name: 'onClose', type: '() => void', description: 'Called when the dropdown should close' },
          { name: 'callerRef', type: 'RefObject<HTMLElement>', description: 'Reference to the trigger element for positioning' },
          { name: 'children', type: 'ReactNode', description: 'Dropdown content (DropdownItem, DropdownSubmenu)' },
          { name: 'portal', type: 'boolean', default: 'true', description: 'Render in a portal' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>DropdownItem</h3>
        <PropsTable props={[
          { name: 'label', type: 'string', description: 'Item label text' },
          { name: 'icon', type: 'ReactNode', description: 'Icon before the label' },
          { name: 'color', type: 'DropdownItemColor', default: 'DropdownItemColor.DEFAULT', description: 'Item color variant' },
          { name: 'onClick', type: '() => void', description: 'Click handler' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />

        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, marginTop: 24 }}>DropdownSubmenu</h3>
        <PropsTable props={[
          { name: 'label', type: 'string', description: 'Submenu trigger label' },
          { name: 'children', type: 'ReactNode', description: 'Submenu content' },
          { name: 'icon', type: 'ReactNode', description: 'Icon before the label' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
