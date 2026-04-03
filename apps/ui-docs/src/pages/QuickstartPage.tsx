import { CodeBlock } from '@/components';

export function QuickstartPage() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Quickstart</h1>
      <p style={{ color: 'var(--docs-text-secondary)', marginBottom: 32, lineHeight: 1.7 }}>
        Get up and running with Haseen UI in under a minute.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, marginTop: 32 }}>1. Install</h2>
      <CodeBlock
        code={`npm install @haseen-me/ui`}
        language="bash"
        title="Terminal"
      />

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, marginTop: 32 }}>2. Wrap with ThemeProvider</h2>
      <CodeBlock
        code={`import { HaseenThemeProvider } from '@haseen-me/ui';

function App() {
  return (
    <HaseenThemeProvider>
      <YourApp />
    </HaseenThemeProvider>
  );
}`}
        title="src/App.tsx"
      />

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, marginTop: 32 }}>3. Use components</h2>
      <CodeBlock
        code={`import { Button, Type, Size } from '@haseen-me/ui';

function MyComponent() {
  return (
    <Button
      type={Type.PRIMARY}
      size={Size.MEDIUM}
      onClick={() => console.log('clicked')}
    >
      Get Started
    </Button>
  );
}`}
        title="Example usage"
      />

      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, marginTop: 32 }}>4. Enums</h2>
      <p style={{ color: 'var(--docs-text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
        Haseen UI uses TypeScript enums for type-safe prop values:
      </p>
      <CodeBlock
        code={`import {
  Type,        // PRIMARY, SECONDARY, TERTIARY, DESTRUCTIVE
  Size,        // SMALL, MEDIUM, LARGE, X_LARGE
  ThemeMode,   // LIGHT, DARK
  Alignment,   // LEFT, CENTER, RIGHT
  Layout,      // HORIZONTAL, VERTICAL
} from '@haseen-me/ui';`}
        title="Core enums"
      />
    </div>
  );
}
