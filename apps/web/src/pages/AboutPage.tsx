import { Link } from 'react-router-dom';
import { Heart, Shield, Globe, Users, ArrowRight } from 'lucide-react';

const VALUES = [
  {
    icon: <Shield size={22} />,
    title: 'Privacy as a Right',
    description: 'We believe privacy is a fundamental human right, not a feature. Everything we build starts with this principle.',
  },
  {
    icon: <Heart size={22} />,
    title: 'User-First Design',
    description: 'Security should be invisible. We design interfaces that are beautiful and intuitive — encryption happens seamlessly.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Transparency',
    description: 'We publish our security architecture, cryptographic choices, and audit results. Trust through verifiability.',
  },
  {
    icon: <Users size={22} />,
    title: 'Accessible Privacy',
    description: 'Privacy tools should be affordable and easy to use. We offer a generous free tier so everyone can protect their data.',
  },
];

const TIMELINE = [
  { year: '2024', title: 'The Idea', description: 'Frustrated with Big Tech surveillance, we set out to build privacy-first productivity tools that anyone could use.' },
  { year: '2025', title: 'Development', description: 'Built the core encryption layer, designed the UI system, and developed the zero-knowledge mail and drive prototypes.' },
  { year: '2026', title: 'Launch', description: 'Haseen launches with encrypted Mail, Drive, and Calendar — making privacy-first productivity accessible to everyone.' },
];

export function AboutPage() {
  return (
    <div style={{ paddingTop: 'var(--hsn-header-height)' }}>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="section-label">About</span>
          <h1 className="section-title" style={{ maxWidth: 600, margin: '0 auto 16px' }}>
            Building the future of private productivity
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Haseen was founded on a simple belief: your data should belong to you.
            Not to advertisers, not to governments, not to us.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: 64 }}>
            <div>
              <span className="section-label">Our Mission</span>
              <h2 className="section-title">Privacy without sacrifice</h2>
              <p style={{ fontSize: 16, color: 'var(--hsn-text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                Big Tech built its empire on your data. They read your emails, scan
                your files, and profile your behavior — all to sell targeted ads.
              </p>
              <p style={{ fontSize: 16, color: 'var(--hsn-text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
                We think there's a better way. Haseen provides the tools you use
                every day — email, file storage, calendar — with end-to-end encryption
                that makes surveillance architecturally impossible.
              </p>
              <p style={{ fontSize: 16, color: 'var(--hsn-text-secondary)', lineHeight: 1.8 }}>
                We make money from subscriptions, not from selling your data.
                Our incentives are aligned with yours.
              </p>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--hsn-brand-subtle), rgba(45,184,175,0.02))',
                borderRadius: 'var(--hsn-radius-lg)',
                padding: 48,
                border: '1px solid var(--hsn-border)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  background: 'var(--hsn-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 36,
                  margin: '0 auto 20px',
                }}
              >
                H
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Haseen</p>
              <p style={{ fontSize: 14, color: 'var(--hsn-text-muted)' }}>
                হাসীন — meaning "beautiful" in Arabic & Bengali
              </p>
              <p style={{ fontSize: 14, color: 'var(--hsn-text-muted)', marginTop: 8 }}>
                Beautiful privacy for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">Values</span>
            <h2 className="section-title">What we stand for</h2>
          </div>
          <div className="grid-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                style={{
                  padding: 28,
                  borderRadius: 'var(--hsn-radius)',
                  border: '1px solid var(--hsn-border)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--hsn-brand-subtle)',
                    color: 'var(--hsn-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  {v.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', lineHeight: 1.6 }}>
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">Journey</span>
            <h2 className="section-title">Our story</h2>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {TIMELINE.map((item, i) => (
              <div
                key={item.year}
                style={{
                  display: 'flex',
                  gap: 24,
                  paddingBottom: i < TIMELINE.length - 1 ? 32 : 0,
                  position: 'relative',
                }}
              >
                {/* Line */}
                {i < TIMELINE.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: 19,
                      top: 40,
                      bottom: 0,
                      width: 2,
                      background: 'var(--hsn-border)',
                    }}
                  />
                )}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--hsn-brand)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {item.year}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <h4 style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>{item.title}</h4>
                  <p style={{ fontSize: 15, color: 'var(--hsn-text-secondary)', lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-dark" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
            Ready to take back your privacy?
          </h2>
          <p style={{ fontSize: 17, color: '#8b95a8', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Join us in building a more private internet. Start free today.
          </p>
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
            }}
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
