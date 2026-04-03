import { Banner } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useState } from 'react';

export function BannerPage() {
  const [dismissed, setDismissed] = useState(false);

  return (
    <ComponentPage
      title="Banner"
      description="A prominent message bar used to communicate status, warnings, or contextual information across the top of a section or page."
    >
      <Section title="Colors" description="Banners support multiple color variants for different contexts.">
        <Preview>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Banner>Default banner message</Banner>
            <Banner color="info">Info banner message</Banner>
            <Banner color="success">Success banner message</Banner>
            <Banner color="warning">Warning banner message</Banner>
            <Banner color="error">Error banner message</Banner>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Banner } from '@haseen-me/ui';

<Banner>Default banner message</Banner>
<Banner color="info">Info banner message</Banner>
<Banner color="success">Success banner message</Banner>
<Banner color="warning">Warning banner message</Banner>
<Banner color="error">Error banner message</Banner>`}
          title="Example: Banner colors"
        />
      </Section>

      <Section title="With icon" description="Add an icon to reinforce the banner message.">
        <Preview>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Banner color="info" icon={<Info size={16} />}>Informational message with icon</Banner>
            <Banner color="success" icon={<CheckCircle size={16} />}>Operation completed successfully</Banner>
            <Banner color="warning" icon={<AlertTriangle size={16} />}>Proceed with caution</Banner>
            <Banner color="error" icon={<XCircle size={16} />}>Something went wrong</Banner>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Banner } from '@haseen-me/ui';
import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

<Banner color="info" icon={<Info size={16} />}>Informational message</Banner>
<Banner color="success" icon={<CheckCircle size={16} />}>Operation completed</Banner>
<Banner color="warning" icon={<AlertTriangle size={16} />}>Proceed with caution</Banner>
<Banner color="error" icon={<XCircle size={16} />}>Something went wrong</Banner>`}
          title="Example: With icons"
        />
      </Section>

      <Section title="Dismissible" description="Banners can be dismissed by the user.">
        <Preview>
          <div style={{ width: '100%' }}>
            {!dismissed ? (
              <Banner color="info" icon={<Info size={16} />} onDismiss={() => setDismissed(true)}>
                This banner can be dismissed
              </Banner>
            ) : (
              <button onClick={() => setDismissed(false)} style={{ cursor: 'pointer', padding: '8px 12px' }}>
                Reset banner
              </button>
            )}
          </div>
        </Preview>
        <CodeBlock
          code={`const [dismissed, setDismissed] = useState(false);

{!dismissed && (
  <Banner color="info" icon={<Info size={16} />} onDismiss={() => setDismissed(true)}>
    This banner can be dismissed
  </Banner>
)}`}
          title="Example: Dismissible banner"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Banner content' },
          { name: 'color', type: "'default' | 'info' | 'success' | 'warning' | 'error'", default: "'default'", description: 'Color variant' },
          { name: 'icon', type: 'ReactNode', description: 'Icon displayed before the content' },
          { name: 'action', type: 'ReactNode', description: 'Action element displayed at the end' },
          { name: 'onDismiss', type: '() => void', description: 'Callback when dismiss button is clicked' },
          { name: 'className', type: 'string', description: 'Additional CSS class' },
          { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
