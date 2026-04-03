import { Typography, TypographySize, TypographyWeight, TypographyOverflow } from '@haseen-me/ui';
import { ComponentPage, Section } from '@/components/ComponentPage';
import { Preview } from '@/components/Preview';
import { CodeBlock } from '@/components/CodeBlock';
import { PropsTable } from '@/components/PropsTable';

export function TypographyPage() {
  return (
    <ComponentPage
      title="Typography"
      description="A versatile text component for rendering headings, body text, captions, and other typographic elements with consistent sizing and styling."
    >
      <Section title="Sizes" description="Typography supports a range of sizes from caption to heading.">
        <Preview>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
            <Typography size={TypographySize.CAPTION}>Caption — Small helper text</Typography>
            <Typography size={TypographySize.BODY}>Body — Standard paragraph text</Typography>
            <Typography size={TypographySize.LARGE}>Large — Emphasized body text</Typography>
            <Typography size={TypographySize.H4}>H4 — Section subheading</Typography>
            <Typography size={TypographySize.H3}>H3 — Section heading</Typography>
            <Typography size={TypographySize.H2}>H2 — Page heading</Typography>
            <Typography size={TypographySize.H1}>H1 — Primary heading</Typography>
          </div>
        </Preview>
        <CodeBlock
          code={`import { Typography, TypographySize } from '@haseen-me/ui';

<Typography size={TypographySize.CAPTION}>Caption</Typography>
<Typography size={TypographySize.BODY}>Body</Typography>
<Typography size={TypographySize.LARGE}>Large</Typography>
<Typography size={TypographySize.H4}>H4</Typography>
<Typography size={TypographySize.H3}>H3</Typography>
<Typography size={TypographySize.H2}>H2</Typography>
<Typography size={TypographySize.H1}>H1</Typography>`}
          title="Example: Sizes"
        />
      </Section>

      <Section title="Weights" description="Control font weight for emphasis.">
        <Preview>
          <Typography weight={TypographyWeight.REGULAR}>Regular weight</Typography>
          <Typography weight={TypographyWeight.MEDIUM}>Medium weight</Typography>
          <Typography weight={TypographyWeight.BOLD}>Bold weight</Typography>
        </Preview>
        <CodeBlock
          code={`import { Typography, TypographyWeight } from '@haseen-me/ui';

<Typography weight={TypographyWeight.REGULAR}>Regular weight</Typography>
<Typography weight={TypographyWeight.MEDIUM}>Medium weight</Typography>
<Typography weight={TypographyWeight.BOLD}>Bold weight</Typography>`}
          title="Example: Weights"
        />
      </Section>

      <Section title="Overflow" description="Truncate text with ellipsis and maxLines.">
        <Preview>
          <div style={{ width: 300 }}>
            <Typography overflow={TypographyOverflow.ELLIPSIS} maxLines={1}>
              This is a very long text that should be truncated with an ellipsis because it exceeds the available width of its container.
            </Typography>
          </div>
          <div style={{ width: 300 }}>
            <Typography overflow={TypographyOverflow.ELLIPSIS} maxLines={2}>
              This is a very long text that should be clamped to two lines. After the second line, it will show an ellipsis to indicate there is more content that is not visible.
            </Typography>
          </div>
        </Preview>
        <CodeBlock
          code={`<Typography overflow={TypographyOverflow.ELLIPSIS} maxLines={1}>
  Long text truncated to 1 line...
</Typography>
<Typography overflow={TypographyOverflow.ELLIPSIS} maxLines={2}>
  Long text clamped to 2 lines...
</Typography>`}
          title="Example: Overflow"
        />
      </Section>

      <Section title="Variants" description="Monospace, uppercase, and custom color.">
        <Preview>
          <Typography mono>Monospace text</Typography>
          <Typography uppercase>Uppercase text</Typography>
          <Typography color="#3182CE">Custom color</Typography>
        </Preview>
        <CodeBlock
          code={`<Typography mono>Monospace text</Typography>
<Typography uppercase>Uppercase text</Typography>
<Typography color="#3182CE">Custom color</Typography>`}
          title="Example: Variants"
        />
      </Section>

      <Section title="Props">
        <PropsTable props={[
          { name: 'children', type: 'ReactNode', description: 'Text content' },
          { name: 'size', type: 'TypographySize', default: 'TypographySize.BODY', description: 'Text size' },
          { name: 'weight', type: 'TypographyWeight', default: 'TypographyWeight.REGULAR', description: 'Font weight' },
          { name: 'overflow', type: 'TypographyOverflow', description: 'Overflow behavior (ELLIPSIS)' },
          { name: 'color', type: 'string', description: 'Text color override' },
          { name: 'mono', type: 'boolean', default: 'false', description: 'Use monospace font' },
          { name: 'uppercase', type: 'boolean', default: 'false', description: 'Transform to uppercase' },
          { name: 'align', type: "'left' | 'center' | 'right'", description: 'Text alignment' },
          { name: 'as', type: 'ElementType', description: 'HTML element to render as' },
          { name: 'forceTheme', type: 'ThemeMode', description: 'Override the current theme' },
          { name: 'selectable', type: 'boolean', default: 'true', description: 'Whether text is selectable' },
          { name: 'maxLines', type: 'number', description: 'Max lines before clamping (with overflow)' },
        ]} />
      </Section>
    </ComponentPage>
  );
}
