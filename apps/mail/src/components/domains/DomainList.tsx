import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Plus, ChevronRight, RefreshCw } from 'lucide-react';
import { useDomainsStore } from '@/store/domains';
import { StatusBadge } from './StatusBadge';
import { AddDomainDialog } from './AddDomainDialog';

export function DomainList() {
  const { domains, loading, fetchDomains, setView, fetchDomain } = useDomainsStore();
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleDomainClick = (id: string) => {
    fetchDomain(id);
    setView('detail');
  };

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 32 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 740, margin: '0 auto' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--hsn-text-primary)',
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Custom Domains
            </h1>
            <p
              style={{
                fontSize: 14,
                color: 'var(--hsn-text-tertiary)',
                margin: '6px 0 0',
              }}
            >
              Manage your custom email domains and DNS configuration
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => fetchDomains()}
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                border: '1px solid var(--hsn-border-primary)',
                background: 'transparent',
                color: 'var(--hsn-text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setAddOpen(true)}
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--hsn-accent-teal)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Plus size={14} />
              Add Domain
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && domains.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              textAlign: 'center',
              padding: '64px 32px',
              background: 'var(--hsn-bg-l0-solid)',
              border: '1px dashed var(--hsn-border-primary)',
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: 'rgba(45,184,175,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Globe size={28} color="var(--hsn-accent-teal)" />
            </div>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--hsn-text-primary)',
                margin: '0 0 8px',
              }}
            >
              No custom domains yet
            </h3>
            <p
              style={{
                fontSize: 14,
                color: 'var(--hsn-text-tertiary)',
                margin: '0 0 20px',
                maxWidth: 340,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              Add your domain to start sending and receiving emails with your own branding
            </p>
            <button
              onClick={() => setAddOpen(true)}
              style={{
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--hsn-accent-teal)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add Your First Domain
            </button>
          </motion.div>
        )}

        {/* Domain cards */}
        <AnimatePresence mode="popLayout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {domains.map((domain, i) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => handleDomainClick(domain.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  background: 'var(--hsn-bg-l0-solid)',
                  border: '1px solid var(--hsn-border-primary)',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                whileHover={{
                  borderColor: 'var(--hsn-accent-teal)',
                  boxShadow: '0 4px 16px rgba(45, 184, 175, 0.08)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(45,184,175,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Globe size={20} color="var(--hsn-accent-teal)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--hsn-text-primary)',
                      marginBottom: 2,
                    }}
                  >
                    {domain.domain}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--hsn-text-tertiary)' }}>
                    Added {new Date(domain.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[domain.mxVerified, domain.spfVerified, domain.dkimVerified, domain.dmarcVerified].map(
                    (v, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: v ? '#30a46c' : 'var(--hsn-border-primary)',
                        }}
                      />
                    ),
                  )}
                </div>

                <StatusBadge status={domain.status} />
                <ChevronRight size={16} color="var(--hsn-text-tertiary)" />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>

      <AddDomainDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
