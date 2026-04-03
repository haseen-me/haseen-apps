import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Lock, Eye, Mail, HardDrive, Calendar } from 'lucide-react';

/* ————— Hero ————— */
function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,184,175,0.08) 0%, transparent 70%)',
      }}
    >
      <span className="section-label">End-to-End Encrypted</span>
      <h1
        style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 800,
          lineHeight: 1.1,
          maxWidth: 800,
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}
      >
        Your productivity,{' '}
        <span style={{ color: 'var(--hsn-brand)' }}>truly private</span>
      </h1>
      <p
        style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'var(--hsn-text-secondary)',
          maxWidth: 580,
          lineHeight: 1.7,
          marginBottom: 40,
        }}
      >
        Haseen is a privacy-first productivity suite with end-to-end encrypted
        mail, drive, and calendar. Zero-knowledge architecture means no one — not
        even us — can read your data.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          to="/pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            borderRadius: 10,
            background: 'var(--hsn-brand)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            transition: 'background 0.15s',
          }}
        >
          Get Started Free <ArrowRight size={18} />
        </Link>
        <Link
          to="/security"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            borderRadius: 10,
            border: '1px solid var(--hsn-border)',
            color: 'var(--hsn-text)',
            fontWeight: 500,
            fontSize: 16,
          }}
        >
          How we protect you
        </Link>
      </div>

      {/* Trust badges */}
      <div
        style={{
          display: 'flex',
          gap: 32,
          marginTop: 64,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {[
          { icon: <Shield size={18} />, label: 'Zero-knowledge' },
          { icon: <Lock size={18} />, label: 'E2E Encrypted' },
          { icon: <Eye size={18} />, label: 'No tracking' },
        ].map((badge) => (
          <div
            key={badge.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              color: 'var(--hsn-text-muted)',
            }}
          >
            <span style={{ color: 'var(--hsn-brand)' }}>{badge.icon}</span>
            {badge.label}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ————— Products ————— */
const PRODUCTS = [
  {
    icon: <Mail size={28} />,
    name: 'Haseen Mail',
    description:
      'End-to-end encrypted email. No ads, no scanning, no profiling. Your inbox is yours alone.',
    features: ['E2E encrypted by default', 'Custom domains', 'Import from Gmail & Outlook', 'Spam protection'],
  },
  {
    icon: <HardDrive size={28} />,
    name: 'Haseen Drive',
    description:
      'Encrypted cloud storage for your files. Upload, organize, and share — without compromising privacy.',
    features: ['Client-side encryption', 'Secure file sharing', 'Version history', 'Up to 100 GB'],
  },
  {
    icon: <Calendar size={28} />,
    name: 'Haseen Calendar',
    description:
      'Plan your schedule privately. Your events and appointments are encrypted and visible only to you.',
    features: ['Encrypted events', 'Shared calendars', 'Reminders & notifications', 'CalDAV sync'],
  },
];

function ProductsSection() {
  return (
    <section className="section section-alt">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <span className="section-label">Products</span>
          <h2 className="section-title">Everything you need, encrypted</h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            A complete productivity suite built from the ground up with privacy as the foundation
            — not an afterthought.
          </p>
        </div>

        <div className="grid-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.name}
              style={{
                padding: 32,
                borderRadius: 'var(--hsn-radius)',
                background: 'var(--hsn-bg)',
                border: '1px solid var(--hsn-border)',
                transition: 'box-shadow 0.2s, border-color 0.2s',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'var(--hsn-brand-subtle)',
                  color: 'var(--hsn-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {product.icon}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{product.name}</h3>
              <p style={{ fontSize: 15, color: 'var(--hsn-text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
                {product.description}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {product.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      fontSize: 14,
                      color: 'var(--hsn-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--hsn-brand)',
                        flexShrink: 0,
                      }}
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ————— Why Haseen ————— */
const REASONS = [
  {
    title: 'Zero-Knowledge Architecture',
    description: 'We never see your data. Encryption keys are generated on your device and never leave it.',
  },
  {
    title: 'Open Standards',
    description: 'Built on proven cryptographic protocols — NaCl, X25519, Ed25519 — not proprietary black boxes.',
  },
  {
    title: 'No Ads, No Tracking',
    description: 'We make money from subscriptions, not by selling your data. No trackers, no profiling, ever.',
  },
  {
    title: 'Easy Migration',
    description: 'Import from Gmail, Outlook, Google Drive. Switch to privacy without losing your data.',
  },
];

function WhySection() {
  return (
    <section className="section">
      <div className="container">
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <span className="section-label">Why Haseen</span>
            <h2 className="section-title">Privacy without compromise</h2>
            <p className="section-subtitle">
              Most "secure" products make you sacrifice usability. Haseen proves you
              can have both — beautiful design and uncompromising encryption.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {REASONS.map((reason) => (
              <div
                key={reason.title}
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--hsn-radius-sm)',
                  border: '1px solid var(--hsn-border)',
                  transition: 'border-color 0.15s',
                }}
              >
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {reason.title}
                </h4>
                <p style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', lineHeight: 1.6 }}>
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ————— CTA Banner ————— */
function CTABanner() {
  return (
    <section className="section section-dark" style={{ textAlign: 'center' }}>
      <div className="container">
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 700,
            color: '#fff',
            marginBottom: 16,
          }}
        >
          Take back your privacy
        </h2>
        <p style={{ fontSize: 17, color: '#8b95a8', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Join thousands who have switched to encrypted productivity.
          Start free — no credit card required.
        </p>
        <Link
          to="/pricing"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 32px',
            borderRadius: 10,
            background: 'var(--hsn-brand)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 16,
            transition: 'background 0.15s',
          }}
        >
          Create Free Account <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

/* ————— Page ————— */
export function HomePage() {
  return (
    <>
      <Hero />
      <ProductsSection />
      <WhySection />
      <CTABanner />
    </>
  );
}
