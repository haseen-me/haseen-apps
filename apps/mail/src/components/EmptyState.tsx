import {
  Inbox,
  Send,
  FileEdit,
  Archive,
  AlertTriangle,
  Trash2,
  Star,
} from 'lucide-react';

const EMPTY_CONFIGS: Record<string, { icon: React.ReactNode; title: string; subtitle: string }> = {
  inbox: {
    icon: <Inbox size={40} />,
    title: 'Your inbox is empty',
    subtitle: 'New messages will appear here',
  },
  starred: {
    icon: <Star size={40} />,
    title: 'No starred messages',
    subtitle: 'Star messages to find them quickly',
  },
  sent: {
    icon: <Send size={40} />,
    title: 'No sent messages',
    subtitle: 'Messages you send will appear here',
  },
  drafts: {
    icon: <FileEdit size={40} />,
    title: 'No drafts',
    subtitle: 'Your draft messages will appear here',
  },
  archive: {
    icon: <Archive size={40} />,
    title: 'No archived messages',
    subtitle: 'Messages you archive will appear here',
  },
  spam: {
    icon: <AlertTriangle size={40} />,
    title: 'No spam',
    subtitle: 'Messages detected as spam will appear here',
  },
  trash: {
    icon: <Trash2 size={40} />,
    title: 'Trash is empty',
    subtitle: 'Deleted messages will appear here',
  },
};

export function EmptyState({ label }: { label: string }) {
  const config = EMPTY_CONFIGS[label] ?? EMPTY_CONFIGS.inbox;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: 40,
        color: 'var(--mail-text-muted)',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <div style={{ opacity: 0.4 }}>{config.icon}</div>
      <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--mail-text-secondary)' }}>
        {config.title}
      </div>
      <div style={{ fontSize: 13 }}>{config.subtitle}</div>
    </div>
  );
}
