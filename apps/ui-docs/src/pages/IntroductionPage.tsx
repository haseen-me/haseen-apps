import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const COMPONENT_CARDS = [
  { name: 'Avatar', description: 'A graphical representation of a user or entity, often an image or initials displayed in a circular container.', path: '/avatar' },
  { name: 'Banner', description: 'Displays prominent messages, actions, and reminders at the top of the screen.', path: '/banner' },
  { name: 'Button', description: 'A clickable element that triggers actions, such as form submission or navigation.', path: '/button' },
  { name: 'Button Group', description: 'Group related buttons together for logical interaction, such as selecting options or triggering actions.', path: '/button-group' },
  { name: 'Chip', description: 'A compact component displaying small information or attributes, commonly used for tags or categories.', path: '/chip' },
  { name: 'Circular Progress', description: 'A progress indicator that can represent the progress or loading state of a task.', path: '/circular-progress' },
  { name: 'Code Input', description: 'A multi-cell input for entering verification codes, PINs, or OTPs.', path: '/code-input' },
  { name: 'Dialog', description: 'A modal overlay for focused tasks like confirmations, forms, or warnings.', path: '/dialog' },
  { name: 'Divider', description: 'A horizontal or vertical separator for grouping and organizing content.', path: '/divider' },
  { name: 'Dropdown', description: 'A menu that appears below a trigger element with selectable options.', path: '/dropdown' },
  { name: 'Facepile', description: 'A stack of overlapping avatars representing a group of people.', path: '/facepile' },
  { name: 'Icon Text', description: 'Pairs an icon with a text label for compact information display.', path: '/icon-text' },
  { name: 'Input Field', description: 'A text input element with label, validation states, and icon support.', path: '/input-field' },
  { name: 'Key Code Sequence', description: 'Displays keyboard shortcut combinations with styled key caps.', path: '/key-code-sequence' },
  { name: 'Mono Tag', description: 'A monospace-styled tag for displaying code-like labels or identifiers.', path: '/mono-tag' },
  { name: 'Select', description: 'A selection control that lets users choose from a list of options.', path: '/select' },
  { name: 'Skeleton', description: 'Animated placeholder blocks used while content is loading.', path: '/skeleton' },
  { name: 'Surface', description: 'A container component providing elevation, padding, and border styling.', path: '/surface' },
  { name: 'Tabs', description: 'Navigate between grouped content sections using horizontal tabs.', path: '/tabs' },
  { name: 'Toast', description: 'Temporary notification messages that auto-dismiss after a duration.', path: '/toast' },
  { name: 'Toggle', description: 'A switch control for toggling between two states.', path: '/toggle' },
  { name: 'Tooltip', description: 'Contextual floating labels that appear on hover for additional information.', path: '/tooltip' },
  { name: 'Typography', description: 'Text component with configurable size, weight, overflow, and semantic element.', path: '/typography' },
];

export function IntroductionPage() {
  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
        Haseen UI — Design System
      </h1>
      <p style={{
        fontSize: 17,
        color: 'var(--docs-text-secondary)',
        lineHeight: 1.7,
        maxWidth: 640,
        marginBottom: 28,
      }}>
        Haseen UI is a React component library built for the Haseen privacy suite.
        It offers a range of customizable components for building beautiful and
        user-friendly interfaces with built-in dark mode support.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
        <Link
          to="/quickstart"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            background: 'var(--docs-accent)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          Quickstart <ArrowRight size={16} />
        </Link>
        <Link
          to="/avatar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid var(--docs-border)',
            color: 'var(--docs-text-primary)',
            fontWeight: 500,
            fontSize: 14,
            textDecoration: 'none',
            background: 'var(--docs-bg)',
          }}
        >
          Explore components
        </Link>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>Components</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 16,
      }}>
        {COMPONENT_CARDS.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            style={{
              display: 'block',
              padding: 20,
              borderRadius: 8,
              border: '1px solid var(--docs-border)',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--docs-accent)';
              e.currentTarget.style.boxShadow = 'var(--docs-shadow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--docs-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{c.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--docs-text-secondary)', lineHeight: 1.5 }}>{c.description}</p>
            <div style={{
              marginTop: 12,
              fontSize: 13,
              color: 'var(--docs-accent)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              Read more <ArrowRight size={14} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
