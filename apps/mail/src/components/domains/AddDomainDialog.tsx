import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Loader2 } from 'lucide-react';
import { useDomainsStore } from '@/store/domains';

interface AddDomainDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddDomainDialog({ open, onClose }: AddDomainDialogProps) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addDomain = useDomainsStore((s) => s.addDomain);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError('');

    try {
      await addDomain(domain.trim().toLowerCase());
      setDomain('');
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              maxWidth: 440,
              background: 'var(--mail-bg)',
              border: '1px solid var(--mail-border)',
              borderRadius: 16,
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
              zIndex: 1001,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid var(--mail-border-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--mail-brand-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={18} color="var(--mail-brand)" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--mail-text)' }}>
                    Add Custom Domain
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mail-text-muted)' }}>
                    Configure email for your domain
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--mail-text-muted)',
                  padding: 4,
                  borderRadius: 6,
                  display: 'flex',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--mail-text-secondary)',
                  marginBottom: 8,
                }}
              >
                Domain name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--mail-border)',
                  background: 'var(--mail-bg-secondary)',
                  color: 'var(--mail-text)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color 0.15s',
                }}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: 13,
                    color: 'var(--mail-danger)',
                    marginTop: 10,
                  }}
                >
                  {error}
                </motion.p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 20,
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    border: '1px solid var(--mail-border)',
                    background: 'transparent',
                    color: 'var(--mail-text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !domain.trim()}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--mail-brand)',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: loading ? 'wait' : 'pointer',
                    opacity: !domain.trim() ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {loading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Add Domain
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
