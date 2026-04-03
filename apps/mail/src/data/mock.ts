import type { Thread } from '@/types/mail';

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();

export const MOCK_THREADS: Thread[] = [
  {
    id: 't1',
    subject: 'Welcome to Haseen Mail',
    snippet: 'Your inbox is now end-to-end encrypted. No one — not even us — can read your messages...',
    lastMessageDate: h(0.5),
    unreadCount: 1,
    labels: ['inbox'],
    from: { name: 'Haseen Team', address: 'hello@haseen.me' },
    hasAttachments: false,
    messages: [
      {
        id: 'm1',
        threadId: 't1',
        from: { name: 'Haseen Team', address: 'hello@haseen.me' },
        to: [{ name: 'You', address: 'you@haseen.me' }],
        cc: [],
        bcc: [],
        subject: 'Welcome to Haseen Mail',
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.7; color: #333;">
          <h2 style="color: #2db8af;">Welcome to Haseen Mail 🔒</h2>
          <p>Your inbox is now <strong>end-to-end encrypted</strong>. No one — not even us — can read your messages.</p>
          <p>Here's what makes Haseen Mail different:</p>
          <ul>
            <li><strong>Zero-knowledge architecture</strong> — Your encryption keys never leave your device</li>
            <li><strong>Per-message session keys</strong> — Each email uses a unique symmetric key</li>
            <li><strong>No ads, no scanning</strong> — We make money from subscriptions, not your data</li>
          </ul>
          <p>Start by composing your first encrypted email. Click the <strong>Compose</strong> button in the sidebar.</p>
          <p style="color: #888; font-size: 13px;">— The Haseen Team</p>
        </div>`,
        bodyText: 'Welcome to Haseen Mail. Your inbox is now end-to-end encrypted.',
        attachments: [],
        date: h(0.5),
        read: false,
        starred: false,
        labels: ['inbox'],
        encrypted: true,
      },
    ],
  },
  {
    id: 't2',
    subject: 'Your encryption keys are ready',
    snippet: 'We have generated your X25519 key pair and Ed25519 signing key. Your private keys are stored...',
    lastMessageDate: h(1),
    unreadCount: 0,
    labels: ['inbox'],
    from: { name: 'Haseen Security', address: 'security@haseen.me' },
    hasAttachments: true,
    messages: [
      {
        id: 'm2',
        threadId: 't2',
        from: { name: 'Haseen Security', address: 'security@haseen.me' },
        to: [{ name: 'You', address: 'you@haseen.me' }],
        cc: [],
        bcc: [],
        subject: 'Your encryption keys are ready',
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.7; color: #333;">
          <h2>Your Encryption Keys</h2>
          <p>We have generated your <strong>X25519 key pair</strong> and <strong>Ed25519 signing key</strong>.</p>
          <p>Your private keys are stored only on your device — encrypted with your password using Argon2id key derivation.</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 16px 0;">
            <strong>Public Key Fingerprint:</strong><br/>
            4A:3B:C7:D2:E9:F1:08:2A:BB:CC:DD:EE:FF:00:11:22
          </div>
          <p>You can verify your keys in <strong>Settings → Security</strong>.</p>
        </div>`,
        bodyText: 'Your encryption keys are ready. Public key fingerprint: 4A:3B:C7:D2...',
        attachments: [{ id: 'a1', filename: 'public-key.asc', contentType: 'application/pgp-keys', size: 2048 }],
        date: h(1),
        read: true,
        starred: true,
        labels: ['inbox'],
        encrypted: true,
      },
    ],
  },
  {
    id: 't3',
    subject: 'Meeting tomorrow at 3pm',
    snippet: 'Hi, just wanted to confirm our meeting tomorrow at 3pm. Looking forward to discussing the project...',
    lastMessageDate: h(4),
    unreadCount: 1,
    labels: ['inbox'],
    from: { name: 'Sarah Chen', address: 'sarah@example.com' },
    hasAttachments: false,
    messages: [
      {
        id: 'm3',
        threadId: 't3',
        from: { name: 'Sarah Chen', address: 'sarah@example.com' },
        to: [{ name: 'You', address: 'you@haseen.me' }],
        cc: [],
        bcc: [],
        subject: 'Meeting tomorrow at 3pm',
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.7; color: #333;">
          <p>Hi,</p>
          <p>Just wanted to confirm our meeting tomorrow at 3pm. Looking forward to discussing the project roadmap and next quarter's priorities.</p>
          <p>Should I book a conference room or shall we do a video call?</p>
          <p>Best,<br/>Sarah</p>
        </div>`,
        bodyText: 'Hi, just wanted to confirm our meeting tomorrow at 3pm.',
        attachments: [],
        date: h(4),
        read: false,
        starred: false,
        labels: ['inbox'],
        encrypted: true,
      },
    ],
  },
  {
    id: 't4',
    subject: 'Invoice #2024-0387',
    snippet: 'Please find attached the invoice for this month. Payment is due within 30 days...',
    lastMessageDate: h(24),
    unreadCount: 0,
    labels: ['inbox'],
    from: { name: 'Billing', address: 'billing@acme.co' },
    hasAttachments: true,
    messages: [
      {
        id: 'm4',
        threadId: 't4',
        from: { name: 'Billing', address: 'billing@acme.co' },
        to: [{ name: 'You', address: 'you@haseen.me' }],
        cc: [],
        bcc: [],
        subject: 'Invoice #2024-0387',
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.7; color: #333;">
          <p>Hello,</p>
          <p>Please find attached the invoice for this month. Payment is due within 30 days.</p>
          <p>Amount: <strong>$49.00</strong></p>
          <p>If you have any questions, please reply to this email.</p>
          <p>Thank you for your business.</p>
        </div>`,
        bodyText: 'Please find attached the invoice for this month.',
        attachments: [{ id: 'a2', filename: 'invoice-2024-0387.pdf', contentType: 'application/pdf', size: 84200 }],
        date: h(24),
        read: true,
        starred: false,
        labels: ['inbox'],
        encrypted: false,
      },
    ],
  },
  {
    id: 't5',
    subject: 'RE: Project Proposal',
    snippet: 'Thanks for the detailed proposal. I have reviewed it with the team and we have a few suggestions...',
    lastMessageDate: h(48),
    unreadCount: 0,
    labels: ['inbox', 'sent'],
    from: { name: 'Alex Rivera', address: 'alex@startup.io' },
    hasAttachments: false,
    messages: [
      {
        id: 'm5a',
        threadId: 't5',
        from: { name: 'You', address: 'you@haseen.me' },
        to: [{ name: 'Alex Rivera', address: 'alex@startup.io' }],
        cc: [],
        bcc: [],
        subject: 'Project Proposal',
        bodyHtml: '<p>Hi Alex, here is the project proposal we discussed...</p>',
        bodyText: 'Hi Alex, here is the project proposal we discussed...',
        attachments: [],
        date: h(72),
        read: true,
        starred: false,
        labels: ['sent'],
        encrypted: true,
      },
      {
        id: 'm5b',
        threadId: 't5',
        from: { name: 'Alex Rivera', address: 'alex@startup.io' },
        to: [{ name: 'You', address: 'you@haseen.me' }],
        cc: [],
        bcc: [],
        subject: 'RE: Project Proposal',
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.7; color: #333;">
          <p>Thanks for the detailed proposal. I've reviewed it with the team and we have a few suggestions:</p>
          <ol>
            <li>Can we extend the timeline by two weeks?</li>
            <li>The budget looks good, but let's add a buffer for unexpected costs</li>
            <li>We'd like to include a mid-project review checkpoint</li>
          </ol>
          <p>Let me know your thoughts.</p>
          <p>Alex</p>
        </div>`,
        bodyText: 'Thanks for the detailed proposal. I have reviewed it with the team.',
        attachments: [],
        date: h(48),
        read: true,
        starred: false,
        labels: ['inbox'],
        encrypted: true,
      },
    ],
  },
  {
    id: 't6',
    subject: 'Sent: Quarterly Report',
    snippet: 'Here is the quarterly report as requested. Please review and let me know if you need changes...',
    lastMessageDate: h(6),
    unreadCount: 0,
    labels: ['sent'],
    from: { name: 'You', address: 'you@haseen.me' },
    hasAttachments: true,
    messages: [
      {
        id: 'm6',
        threadId: 't6',
        from: { name: 'You', address: 'you@haseen.me' },
        to: [{ name: 'Team', address: 'team@acme.co' }],
        cc: [{ name: 'Manager', address: 'manager@acme.co' }],
        bcc: [],
        subject: 'Quarterly Report',
        bodyHtml: '<p>Here is the quarterly report. Please review.</p>',
        bodyText: 'Here is the quarterly report. Please review.',
        attachments: [{ id: 'a3', filename: 'Q1-report.pdf', contentType: 'application/pdf', size: 156000 }],
        date: h(6),
        read: true,
        starred: false,
        labels: ['sent'],
        encrypted: true,
      },
    ],
  },
  {
    id: 't7',
    subject: '(Draft) Product launch announcement',
    snippet: 'We are excited to announce the launch of our new...',
    lastMessageDate: h(2),
    unreadCount: 0,
    labels: ['drafts'],
    from: { name: 'You', address: 'you@haseen.me' },
    hasAttachments: false,
    messages: [
      {
        id: 'm7',
        threadId: 't7',
        from: { name: 'You', address: 'you@haseen.me' },
        to: [{ address: 'press@example.com' }],
        cc: [],
        bcc: [],
        subject: 'Product launch announcement',
        bodyHtml: '<p>We are excited to announce the launch of our new...</p>',
        bodyText: 'We are excited to announce the launch of our new...',
        attachments: [],
        date: h(2),
        read: true,
        starred: false,
        labels: ['drafts'],
        encrypted: false,
      },
    ],
  },
];
