import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with essential privacy tools.',
    features: [
      '1 GB encrypted mail storage',
      '1 GB encrypted drive storage',
      'Calendar with encrypted events',
      'Custom Haseen address',
      'Community support',
    ],
    cta: 'Start Free',
  },
  {
    name: 'Pro',
    price: '$4',
    period: '/month',
    description: 'More space, more features, more privacy.',
    features: [
      '15 GB encrypted mail storage',
      '50 GB encrypted drive storage',
      'Custom domain support',
      '10 mail aliases',
      'Priority support',
      'Advanced search',
      'Calendar sharing',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$8',
    period: '/user/month',
    description: 'Privacy-first collaboration for teams.',
    features: [
      '50 GB mail per user',
      '100 GB drive per user',
      'Multiple custom domains',
      'Unlimited aliases',
      'Admin console',
      'Team management',
      'Dedicated support',
      'SSO (SAML)',
    ],
    cta: 'Contact Sales',
  },
];

const FAQS = [
  {
    question: 'Can you read my emails?',
    answer: 'No. All emails are end-to-end encrypted. We use a zero-knowledge architecture, which means we never have access to your encryption keys or plaintext data.',
  },
  {
    question: 'What happens if I forget my password?',
    answer: 'Because we use zero-knowledge encryption, we cannot reset your password. We provide a recovery key during signup that you should store safely.',
  },
  {
    question: 'Can I use my own domain?',
    answer: 'Yes. Pro and Business plans support custom domains. You can set up your-name@yourdomain.com with full end-to-end encryption.',
  },
  {
    question: 'Is there a free plan?',
    answer: 'Yes. The free plan includes 1 GB of encrypted mail and drive storage, plus a full-featured calendar. No credit card required.',
  },
  {
    question: 'Can I import from Gmail or Outlook?',
    answer: 'Yes. We provide one-click migration tools that import your existing emails, contacts, and files. Everything is encrypted on import.',
  },
  {
    question: 'Where are your servers located?',
    answer: 'Our infrastructure is located in privacy-friendly jurisdictions with strong data protection laws. All data is encrypted at rest and in transit.',
  },
];

export function PricingPage() {
  return (
    <div style={{ paddingTop: 'var(--hsn-header-height)' }}>
      {/* Hero */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="section-label">Pricing</span>
          <h1 className="section-title" style={{ maxWidth: 500, margin: '0 auto 16px' }}>
            Simple, transparent pricing
          </h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Privacy shouldn't be a luxury. Start free and upgrade when you need more.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '0 24px 100px' }}>
        <div className="container">
          <div className="grid-3" style={{ alignItems: 'start' }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  padding: 36,
                  borderRadius: 'var(--hsn-radius-lg)',
                  border: plan.highlighted
                    ? '2px solid var(--hsn-brand)'
                    : '1px solid var(--hsn-border)',
                  background: plan.highlighted ? 'var(--hsn-brand-subtle)' : 'var(--hsn-bg)',
                  position: 'relative',
                }}
              >
                {plan.highlighted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'var(--hsn-brand)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: 20,
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                <p style={{ fontSize: 14, color: 'var(--hsn-text-secondary)', marginBottom: 20 }}>
                  {plan.description}
                </p>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--hsn-text-muted)', marginLeft: 4 }}>
                    {plan.period}
                  </span>
                </div>
                <Link
                  to="/"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px 0',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    background: plan.highlighted ? 'var(--hsn-brand)' : 'transparent',
                    color: plan.highlighted ? '#fff' : 'var(--hsn-brand)',
                    border: plan.highlighted ? 'none' : '1px solid var(--hsn-brand)',
                    marginBottom: 24,
                    transition: 'background 0.15s',
                  }}
                >
                  {plan.cta}
                </Link>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: 14,
                        color: 'var(--hsn-text-secondary)',
                      }}
                    >
                      <Check size={16} style={{ color: 'var(--hsn-brand)', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span className="section-label">FAQ</span>
            <h2 className="section-title">Frequently asked questions</h2>
          </div>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--hsn-radius-sm)',
                  border: '1px solid var(--hsn-border)',
                  background: 'var(--hsn-bg)',
                }}
              >
                <summary
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  {faq.question}
                  <ArrowRight size={16} style={{ color: 'var(--hsn-text-muted)', transition: 'transform 0.2s', flexShrink: 0 }} />
                </summary>
                <p style={{ marginTop: 12, fontSize: 15, color: 'var(--hsn-text-secondary)', lineHeight: 1.7 }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
