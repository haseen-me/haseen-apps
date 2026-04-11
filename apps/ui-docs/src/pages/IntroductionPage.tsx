import { Link } from 'react-router-dom';
import { ArrowRight, MoonStar, PanelsTopLeft, Sparkles, SwatchBook } from 'lucide-react';

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
      <section
        className="docs-glass docs-gradient-border"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 32,
          padding: '34px 34px 30px',
          marginBottom: 38,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(90, 140, 255, 0.14), transparent 24%), radial-gradient(circle at top left, rgba(45, 184, 175, 0.12), transparent 24%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              borderRadius: 999,
              background: 'var(--docs-bg-tertiary)',
              border: '1px solid var(--docs-border)',
              color: 'var(--docs-text-secondary)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} />
            Latest Haseen UI
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 4.4rem)', fontWeight: 800, letterSpacing: '-0.07em', lineHeight: 0.98, marginTop: 18, maxWidth: 780 }}>
            Premium components for privacy-first products.
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--docs-text-secondary)',
            lineHeight: 1.75,
            maxWidth: 700,
            marginTop: 18,
            marginBottom: 28,
          }}>
            Haseen UI is the shared React design system behind the Haseen suite. It now leans more toward
            the calm polish of Apple, Proton, and Skiff with richer surfaces, stronger typography, and
            deeply considered dark mode.
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: 'var(--docs-bg-tertiary)', border: '1px solid var(--docs-border)', color: 'var(--docs-text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <MoonStar size={15} />
              Refined dark mode
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: 'var(--docs-bg-tertiary)', border: '1px solid var(--docs-border)', color: 'var(--docs-text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <PanelsTopLeft size={15} />
              Glass + elevated surfaces
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 999, background: 'var(--docs-bg-tertiary)', border: '1px solid var(--docs-border)', color: 'var(--docs-text-secondary)', fontSize: 13, fontWeight: 600 }}>
              <SwatchBook size={15} />
              Updated tokens and buttons
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 12, marginBottom: 48, flexWrap: 'wrap' }}>
        <Link
          to="/quickstart"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '14px 22px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--docs-accent), var(--docs-accent-2))',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            boxShadow: 'var(--docs-shadow)',
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
            padding: '14px 22px',
            borderRadius: 18,
            border: '1px solid var(--docs-border)',
            color: 'var(--docs-text-primary)',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            background: 'var(--docs-bg-secondary)',
          }}
        >
          Explore components
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="docs-glass" style={{ borderRadius: 24, padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--docs-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Direction</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 4 }}>Sharper visuals</div>
          <p style={{ fontSize: 14, color: 'var(--docs-text-secondary)' }}>Softer glass, stronger contrast, and more expressive spacing.</p>
        </div>
        <div className="docs-glass" style={{ borderRadius: 24, padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--docs-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Coverage</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 4 }}>{COMPONENT_CARDS.length} components</div>
          <p style={{ fontSize: 14, color: 'var(--docs-text-secondary)' }}>Production-ready primitives for product surfaces, forms, and navigation.</p>
        </div>
        <div className="docs-glass" style={{ borderRadius: 24, padding: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--docs-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Modes</div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 4 }}>Light + dark</div>
          <p style={{ fontSize: 14, color: 'var(--docs-text-secondary)' }}>Theme-aware tokens designed to feel premium in both environments.</p>
        </div>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.05em', marginBottom: 20 }}>Components</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 18,
      }}>
        {COMPONENT_CARDS.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            style={{
              display: 'block',
              padding: 22,
              borderRadius: 24,
              border: '1px solid var(--docs-border)',
              textDecoration: 'none',
              color: 'inherit',
              background: 'var(--docs-bg-secondary)',
              transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--docs-accent)';
              e.currentTarget.style.boxShadow = 'var(--docs-shadow)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--docs-border)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <h3 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>{c.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--docs-text-secondary)', lineHeight: 1.6 }}>{c.description}</p>
            <div style={{
              marginTop: 14,
              fontSize: 13,
              color: 'var(--docs-accent)',
              fontWeight: 700,
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
