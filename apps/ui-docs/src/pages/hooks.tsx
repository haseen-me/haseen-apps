import { ComponentPage, Section } from '@/components/ComponentPage';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function UseOnClickOutsidePage() {
  return (
    <ComponentPage
      title="useOnClickOutside"
      description="Detect clicks outside a referenced element. Commonly used for closing dropdowns, modals, and popovers."
    >
      <Section title="Usage">
        <CodeBlock
          code={`import { useRef } from 'react';
import { useOnClickOutside } from '@haseen-me/ui';

function MyDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside(ref, {
    onClickOutside: () => onClose(),
    enabled: true,
  });

  return <div ref={ref}>Dropdown content</div>;
}`}
          title="Example"
        />
      </Section>

      <Section title="Options">
        <PropsTable props={[
          { name: 'onClickOutside', type: '(e: MouseEvent | TouchEvent) => void', description: 'Callback when click lands outside the ref element' },
          { name: 'enabled', type: 'boolean', default: 'true', description: 'Enable or disable the listener' },
          { name: 'excludeRefs', type: 'RefObject[]', default: '[]', description: 'Additional refs to exclude from "outside" detection' },
          { name: 'excludeClassNames', type: 'string[]', default: '[]', description: 'CSS class names to exclude from outside detection' },
        ]} />
      </Section>
    </ComponentPage>
  );
}

export function UseKeyboardNavigationPage() {
  return (
    <ComponentPage
      title="useKeyboardNavigation"
      description="Arrow key navigation for lists, menus, and other sequential UI. Returns the focused index and helper methods."
    >
      <Section title="Usage">
        <CodeBlock
          code={`import { useKeyboardNavigation } from '@haseen-me/ui';

function MenuList({ items, onSelect }: { items: string[]; onSelect: (i: number) => void }) {
  const { focusedIndex } = useKeyboardNavigation({
    itemCount: items.length,
    onSelect,
    onEscape: () => console.log('escaped'),
  });

  return (
    <ul>
      {items.map((item, i) => (
        <li key={i} style={{ background: i === focusedIndex ? '#eee' : 'transparent' }}>
          {item}
        </li>
      ))}
    </ul>
  );
}`}
          title="Example"
        />
      </Section>

      <Section title="Options">
        <PropsTable props={[
          { name: 'itemCount', type: 'number', description: 'Total number of navigable items' },
          { name: 'onSelect', type: '(index: number) => void', description: 'Callback when Enter is pressed on focused item' },
          { name: 'onEscape', type: '() => void', description: 'Callback when Escape is pressed' },
          { name: 'enabled', type: 'boolean', default: 'true', description: 'Enable or disable navigation' },
        ]} />
      </Section>

      <Section title="Return value">
        <PropsTable props={[
          { name: 'focusedIndex', type: 'number', description: 'Currently focused item index (-1 when none)' },
          { name: 'setFocusedIndex', type: '(index: number) => void', description: 'Manually set focus' },
          { name: 'reset', type: '() => void', description: 'Reset focused index to -1' },
          { name: 'usingMouse', type: 'boolean', description: 'Whether user is using mouse (vs keyboard)' },
        ]} />
      </Section>
    </ComponentPage>
  );
}

export function UseMousePositionPage() {
  return (
    <ComponentPage
      title="useMousePosition"
      description="Track the mouse cursor position with throttling to minimize re-renders."
    >
      <Section title="Usage">
        <CodeBlock
          code={`import { useMousePosition } from '@haseen-me/ui';

function CursorTracker() {
  const { x, y } = useMousePosition(200); // throttle 200ms

  return <div>Cursor: {x}, {y}</div>;
}`}
          title="Example"
        />
      </Section>

      <Section title="Parameters">
        <PropsTable props={[
          { name: 'throttleMs', type: 'number', default: '200', description: 'Throttle interval in milliseconds' },
        ]} />
      </Section>

      <Section title="Return value">
        <PropsTable props={[
          { name: 'x', type: 'number', description: 'Cursor clientX position' },
          { name: 'y', type: 'number', description: 'Cursor clientY position' },
        ]} />
      </Section>
    </ComponentPage>
  );
}

export function UseOnEscapePressPage() {
  return (
    <ComponentPage
      title="useOnEscapePress"
      description="Register a callback for the Escape key. Useful for closing modals, popovers, and overlays."
    >
      <Section title="Usage">
        <CodeBlock
          code={`import { useOnEscapePress } from '@haseen-me/ui';

function Modal({ onClose }: { onClose: () => void }) {
  useOnEscapePress(onClose);

  return <div>Press Escape to close</div>;
}`}
          title="Example"
        />
      </Section>

      <Section title="Parameters">
        <PropsTable props={[
          { name: 'handler', type: '() => void', description: 'Callback invoked when Escape is pressed' },
          { name: 'enabled', type: 'boolean', default: 'true', description: 'Enable or disable the listener' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
