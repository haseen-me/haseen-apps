import { Shield, Lock, Key, Eye, Server, Code, FileCheck, AlertTriangle } from 'lucide-react';

const PRINCIPLES = [
  {
    icon: <Lock size={22} />,
    title: 'End-to-End Encryption',
    description:
      'All data — emails, files, calendar events — is encrypted on your device using NaCl before it reaches our servers. We only ever store ciphertext.',
  },
  {
    icon: <Eye size={22} />,
    title: 'Zero-Knowledge Architecture',
    description:
      'We architecturally cannot read your data. Private keys are generated on your device and never transmitted. Even a subpoena cannot produce your plaintext.',
  },
  {
    icon: <Key size={22} />,
    title: 'SRP Authentication',
    description:
      'Your password is never sent to our servers — not even as a hash. We use the Secure Remote Password protocol so the server only stores a mathematical verifier.',
  },
  {
    icon: <Server size={22} />,
    title: 'Minimal Server Trust',
    description:
      'Our threat model assumes a fully compromised server. Even in that scenario, your encrypted data remains unreadable without your device-held private keys.',
  },
];

const CRYPTO_DETAILS = [
  { label: 'Asymmetric Encryption', value: 'X25519 (Curve25519 Diffie-Hellman)' },
  { label: 'Symmetric Encryption', value: 'NaCl secretbox (XSalsa20-Poly1305)' },
  { label: 'Digital Signatures', value: 'Ed25519' },
  { label: 'Authentication', value: 'SRP-6a (Secure Remote Password)' },
  { label: 'Key Derivation', value: 'Argon2id' },
  { label: 'Session Keys', value: 'Per-message unique keys, encrypted per-recipient' },
];

const ENCRYPTION_STEPS = [
  { step: '1', title: 'Generate Session Key', description: 'A random symmetric key is created for each message or file.' },
  { step: '2', title: 'Encrypt Content', description: 'The content is encrypted with the session key using NaCl secretbox.' },
  { step: '3', title: 'Encrypt Session Key', description: 'The session key is encrypted with each recipient\'s X25519 public key.' },
  { step: '4', title: 'Sign Envelope', description: 'The encrypted envelope is signed with the sender\'s Ed25519 key.' },
  { step: '5', title: 'Store Ciphertext', description: 'Only the encrypted envelope reaches the server. Plaintext never exists server-side.' },
];

const SECURITY_PRACTICES = [
  { icon: <Code size={20} />, title: 'Security Audits', description: 'Regular third-party security audits of our cryptographic implementation and infrastructure.' },
  { icon: <FileCheck size={20} />, title: 'Bug Bounty', description: 'We run a responsible disclosure program. Security researchers are rewarded for finding vulnerabilities.' },
  { icon: <AlertTriangle size={20} />, title: 'Transparency Reports', description: 'We publish regular transparency reports detailing any government data requests we receive.' },
  { icon: <Shield size={20} />, title: 'Infrastructure Security', description: 'Servers in privacy-friendly jurisdictions. Full disk encryption, minimal logging, and strict access controls.' },
];

export function SecurityPage() {
  return (
    <div style={{ paddingTop: 'var(--hsn-header-height)' }}>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="section-label">Security</span>
          <h1 className="section-title" style={{ maxWidth: 640, margin: '0 auto 16px' }}>
            Security you don't have to trust — you can verify
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Haseen is built on a zero-knowledge architecture. We can't read your data,
            and we've designed the system so no one else can either.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>
            Core Security Principles
          </h2>
          <div className="grid-2">
            {PRINCIPLES.map((p) => (
              <div
                key={p.title}
                style={{
                  padding: 32,
                  borderRadius: 'var(--hsn-radius)',
                  background: 'var(--hsn-bg)',
                  border: '1px solid var(--hsn-border)',
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
                    marginBottom: 16,
                  }}
                >
                  {p.icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 15, color: 'var(--hsn-text-secondary)', lineHeight: 1.7 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Encryption Works */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">How It Works</span>
            <h2 className="section-title">The encryption flow</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Every piece of data follows the same rigorous encryption pipeline.
            </p>
          </div>

          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {ENCRYPTION_STEPS.map((step, i) => (
              <div
                key={step.step}
                style={{
                  display: 'flex',
                  gap: 20,
                  padding: '24px 0',
                  borderBottom: i < ENCRYPTION_STEPS.length - 1 ? '1px solid var(--hsn-border)' : 'none',
                }}
              >
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
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {step.step}
                </div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', lineHeight: 1.6 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cryptographic Details */}
      <section className="section section-dark">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">Cryptography</span>
            <h2 className="section-title" style={{ color: '#fff' }}>
              Battle-tested algorithms
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We rely on well-established, peer-reviewed cryptographic primitives — no homebrew crypto.
            </p>
          </div>

          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              borderRadius: 'var(--hsn-radius)',
              border: '1px solid #30363d',
              overflow: 'hidden',
            }}
          >
            {CRYPTO_DETAILS.map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  borderBottom: i < CRYPTO_DETAILS.length - 1 ? '1px solid #30363d' : 'none',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 14, color: '#8b95a8', fontWeight: 500 }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--hsn-brand-light)',
                    background: 'rgba(45,184,175,0.1)',
                    padding: '4px 10px',
                    borderRadius: 6,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 48 }}>
            Security Practices
          </h2>
          <div className="grid-4">
            {SECURITY_PRACTICES.map((p) => (
              <div
                key={p.title}
                style={{
                  padding: 24,
                  borderRadius: 'var(--hsn-radius-sm)',
                  border: '1px solid var(--hsn-border)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--hsn-brand-subtle)',
                    color: 'var(--hsn-brand)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  {p.icon}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{p.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--hsn-text-secondary)', lineHeight: 1.6 }}>
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
