import { ComponentPage, Section } from '@/components/ComponentPage';
import { Package, Github, Palette, BookOpen } from 'lucide-react';

const RESOURCES = [
  {
    icon: <Package size={24} />,
    title: 'NPM Package',
    description: 'Install @haseen-me/ui from the npm registry.',
    url: 'https://www.npmjs.com/package/@haseen-me/ui',
  },
  {
    icon: <Github size={24} />,
    title: 'GitHub Repository',
    description: 'Source code, issues, and contributing guidelines.',
    url: 'https://github.com/haseen-me/ui',
  },
  {
    icon: <Palette size={24} />,
    title: 'Design Tokens',
    description: 'Colors, spacing, typography, and other tokens.',
    url: '/tokens',
    internal: true,
  },
  {
    icon: <BookOpen size={24} />,
    title: 'Component Library',
    description: '23+ components with live demos and prop tables.',
    url: '/avatar',
    internal: true,
  },
];

export function ResourcesPage() {
  return (
    <ComponentPage
      title="Resources"
      description="Useful links and resources for working with Haseen UI."
    >
      <Section title="Links">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target={r.internal ? undefined : '_blank'}
              rel={r.internal ? undefined : 'noopener noreferrer'}
              style={{
                display: 'flex',
                gap: 16,
                padding: 20,
                borderRadius: 8,
                border: '1px solid var(--docs-border)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--docs-accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--docs-border)'; }}
            >
              <div style={{ color: 'var(--docs-accent)', flexShrink: 0, marginTop: 2 }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 13, color: 'var(--docs-text-secondary)', lineHeight: 1.5 }}>
                  {r.description}
                </div>
              </div>
            </a>
          ))}
        </div>
      </Section>
    </ComponentPage>
  );
}
