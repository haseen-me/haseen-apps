import {
  Mail,
  HardDrive,
  Calendar,
  Shield,
  Search,
  Lock,
  Zap,
  Globe,
  Smartphone,
  RefreshCw,
  FolderOpen,
  Users,
} from 'lucide-react';

const PRODUCT_SECTIONS = [
  {
    id: 'mail',
    label: 'Haseen Mail',
    icon: <Mail size={24} />,
    headline: 'Email designed for privacy',
    description:
      'Every message is end-to-end encrypted before it leaves your device. No ads read your inbox, no algorithms profile you, no third party scans your attachments.',
    features: [
      { icon: <Lock size={20} />, title: 'End-to-End Encryption', description: 'Messages are encrypted on your device using NaCl. The server only stores ciphertext it cannot decrypt.' },
      { icon: <Search size={20} />, title: 'Encrypted Search', description: 'Search your mail privately. Search indices are client-side encrypted — the server never sees your queries.' },
      { icon: <Globe size={20} />, title: 'Custom Domains', description: 'Use your own domain. Set up your-name@yourdomain.com with full encryption support.' },
      { icon: <RefreshCw size={20} />, title: 'Easy Migration', description: 'Import from Gmail, Outlook, Yahoo, and more. One-click migration preserves your folders and labels.' },
    ],
  },
  {
    id: 'drive',
    label: 'Haseen Drive',
    icon: <HardDrive size={24} />,
    headline: 'Cloud storage, zero knowledge',
    description:
      'Upload, organize, and share files with complete confidence. Every file is encrypted client-side before upload — we never see your data.',
    features: [
      { icon: <Shield size={20} />, title: 'Client-Side Encryption', description: 'Files are encrypted in your browser before upload. Even if our servers were breached, your files remain safe.' },
      { icon: <FolderOpen size={20} />, title: 'Organize Freely', description: 'Folders, tags, and search — all the tools you expect, all fully encrypted.' },
      { icon: <Users size={20} />, title: 'Secure Sharing', description: 'Share files with end-to-end encrypted links. Set passwords, expiry dates, and download limits.' },
      { icon: <Smartphone size={20} />, title: 'Access Anywhere', description: 'Web, desktop, and mobile apps. Your encrypted files, synced across all your devices.' },
    ],
  },
  {
    id: 'calendar',
    label: 'Haseen Calendar',
    icon: <Calendar size={24} />,
    headline: 'Plan your time, privately',
    description:
      'Your schedule is personal. Haseen Calendar encrypts every event, attendee, and note — keeping your plans invisible to everyone but you.',
    features: [
      { icon: <Lock size={20} />, title: 'Encrypted Events', description: 'Event titles, descriptions, locations, and attendees are all encrypted at rest.' },
      { icon: <Users size={20} />, title: 'Shared Calendars', description: 'Share calendars with colleagues or family. Each participant\u2019s access is individually encrypted.' },
      { icon: <Zap size={20} />, title: 'Smart Reminders', description: 'Customizable notifications across email and push. Never miss what matters.' },
      { icon: <RefreshCw size={20} />, title: 'CalDAV Sync', description: 'Connect with your existing calendar apps via CalDAV. Works with Apple Calendar, Thunderbird, and more.' },
    ],
  },
];

export function FeaturesPage() {
  return (
    <div style={{ paddingTop: 'var(--hsn-header-height)' }}>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="section-label">Features</span>
          <h1 className="section-title" style={{ maxWidth: 600, margin: '0 auto 16px' }}>
            One suite, complete privacy
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Haseen brings together mail, drive, and calendar — all end-to-end encrypted
            with a zero-knowledge architecture.
          </p>
        </div>
      </section>

      {/* Product sections */}
      {PRODUCT_SECTIONS.map((product, i) => (
        <section
          key={product.id}
          className={`section ${i % 2 === 1 ? 'section-alt' : ''}`}
          id={product.id}
        >
          <div className="container">
            <div style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'var(--hsn-brand-subtle)',
                  color: 'var(--hsn-cta-primary-default)',
                  fontWeight: 600,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {product.icon}
                {product.label}
              </div>
              <h2 className="section-title">{product.headline}</h2>
              <p className="section-subtitle">{product.description}</p>
            </div>

            <div className="grid-2">
              {product.features.map((feat) => (
                <div
                  key={feat.title}
                  style={{
                    padding: 28,
                    borderRadius: '8px',
                    border: '1px solid var(--hsn-border-primary)',
                    background: 'var(--hsn-bg-app)',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: 'var(--hsn-brand-subtle)',
                      color: 'var(--hsn-cta-primary-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{feat.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', lineHeight: 1.7 }}>
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
