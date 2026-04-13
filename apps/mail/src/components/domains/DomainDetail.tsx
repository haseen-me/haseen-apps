import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Plus,
  Mail,
  X,
  Loader2,
  Shield,
  Activity,
} from 'lucide-react';
import { useDomainsStore } from '@/store/domains';
import { StatusBadge } from './StatusBadge';
import { DNSRecordCard } from './DNSRecordCard';

export function DomainDetail() {
  const {
    activeDomain,
    activeDomainLoading,
    activeDomainId,
    fetchDomain,
    verifyDomain,
    deleteDomain,
    addMailbox,
    deleteMailbox,
    setView,
    dnsLogs,
    dnsLogsLoading,
    fetchDNSLogs,
  } = useDomainsStore();

  const [verifying, setVerifying] = useState(false);
  const [addMailboxOpen, setAddMailboxOpen] = useState(false);
  const [mailboxLocal, setMailboxLocal] = useState('');
  const [mailboxDisplay, setMailboxDisplay] = useState('');
  const [mailboxCatchAll, setMailboxCatchAll] = useState(false);
  const [mailboxLoading, setMailboxLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [tab, setTab] = useState<'dns' | 'mailboxes' | 'logs'>('dns');

  useEffect(() => {
    if (activeDomainId) fetchDomain(activeDomainId);
  }, [activeDomainId, fetchDomain]);

  if (activeDomainLoading || !activeDomain) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 size={24} color="var(--mail-brand)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const { domain, dnsRecords, mailboxes } = activeDomain;

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyDomain(domain.id);
      await fetchDomain(domain.id);
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    await deleteDomain(domain.id);
  };

  const handleAddMailbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailboxLocal.trim()) return;
    setMailboxLoading(true);
    try {
      await addMailbox(domain.id, mailboxLocal.trim(), mailboxDisplay.trim(), mailboxCatchAll);
      setMailboxLocal('');
      setMailboxDisplay('');
      setMailboxCatchAll(false);
      setAddMailboxOpen(false);
    } finally {
      setMailboxLoading(false);
    }
  };

  const handleShowLogs = () => {
    setTab('logs');
    fetchDNSLogs(domain.id);
  };

  const verifiedCount = [domain.mxVerified, domain.spfVerified, domain.dkimVerified, domain.dmarcVerified].filter(Boolean).length;

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 32 }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 740, margin: '0 auto' }}
      >
        {/* Back + Header */}
        <button
          onClick={() => setView('list')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--mail-text-muted)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
            marginBottom: 20,
          }}
        >
          <ArrowLeft size={14} />
          Back to Domains
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--mail-text)',
                  margin: 0,
                  letterSpacing: '-0.025em',
                }}
              >
                {domain.domain}
              </h1>
              <StatusBadge status={domain.status} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--mail-text-muted)', margin: 0 }}>
              {verifiedCount}/4 DNS records verified
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleVerify}
              disabled={verifying}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                border: '1px solid var(--mail-border)',
                background: 'transparent',
                color: 'var(--mail-text-secondary)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw
                size={14}
                style={verifying ? { animation: 'spin 1s linear infinite' } : undefined}
              />
              Verify DNS
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              style={{
                padding: '9px 14px',
                borderRadius: 10,
                border: '1px solid var(--mail-border)',
                background: 'transparent',
                color: 'var(--mail-danger)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            background: 'var(--mail-bg-secondary)',
            border: '1px solid var(--mail-border)',
            borderRadius: 12,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Shield size={16} color="var(--mail-brand)" />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mail-text)' }}>
              Verification Progress
            </span>
            <span style={{ fontSize: 12, color: 'var(--mail-text-muted)' }}>
              {verifiedCount}/4 complete
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['MX', 'SPF', 'DKIM', 'DMARC'].map((label, idx) => {
              const verified = [domain.mxVerified, domain.spfVerified, domain.dkimVerified, domain.dmarcVerified][idx];
              return (
                <motion.div
                  key={label}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.4 }}
                  style={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    background: verified ? 'var(--mail-brand)' : 'var(--mail-border)',
                    transformOrigin: 'left',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {['MX', 'SPF', 'DKIM', 'DMARC'].map((label) => (
              <div
                key={label}
                style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--mail-text-muted)', fontWeight: 500 }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--mail-border)',
            marginBottom: 24,
          }}
        >
          {[
            { key: 'dns' as const, label: 'DNS Records', icon: Shield },
            { key: 'mailboxes' as const, label: 'Mailboxes', icon: Mail },
            { key: 'logs' as const, label: 'Activity Log', icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                if (key === 'logs') fetchDNSLogs(domain.id);
              }}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: tab === key ? '2px solid var(--mail-brand)' : '2px solid transparent',
                color: tab === key ? 'var(--mail-brand)' : 'var(--mail-text-muted)',
                fontSize: 13,
                fontWeight: tab === key ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* DNS Records Tab */}
        <AnimatePresence mode="wait">
          {tab === 'dns' && (
            <motion.div
              key="dns"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <DNSRecordCard
                record={{ ...dnsRecords.mx, verified: domain.mxVerified }}
                label="MX Record"
                description="Points incoming mail to our servers"
                index={0}
              />
              <DNSRecordCard
                record={{ ...dnsRecords.spf, verified: domain.spfVerified }}
                label="SPF Record"
                description="Authorizes our servers to send mail for your domain"
                index={1}
              />
              <DNSRecordCard
                record={{ ...dnsRecords.dkim, verified: domain.dkimVerified }}
                label="DKIM Record"
                description="Cryptographic signature for email authentication"
                index={2}
              />
              <DNSRecordCard
                record={{ ...dnsRecords.dmarc, verified: domain.dmarcVerified }}
                label="DMARC Record"
                description="Policy for handling authentication failures"
                index={3}
              />
            </motion.div>
          )}

          {/* Mailboxes Tab */}
          {tab === 'mailboxes' && (
            <motion.div
              key="mailboxes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button
                  onClick={() => setAddMailboxOpen(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'var(--mail-brand)',
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
                  Add Mailbox
                </button>
              </div>

              {mailboxes.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'var(--mail-bg-secondary)',
                    border: '1px dashed var(--mail-border)',
                    borderRadius: 12,
                  }}
                >
                  <Mail size={28} color="var(--mail-text-muted)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, color: 'var(--mail-text-muted)', margin: 0 }}>
                    No mailboxes configured yet
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mailboxes.map((mb, i) => (
                    <motion.div
                      key={mb.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '14px 16px',
                        background: 'var(--mail-bg-secondary)',
                        border: '1px solid var(--mail-border)',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'var(--mail-brand-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Mail size={14} color="var(--mail-brand)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--mail-text)' }}>
                          {mb.localPart}@{domain.domain}
                        </div>
                        {mb.displayName && (
                          <div style={{ fontSize: 12, color: 'var(--mail-text-muted)' }}>
                            {mb.displayName}
                          </div>
                        )}
                      </div>
                      {mb.isCatchAll && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'rgba(59, 130, 246, 0.12)',
                            color: '#3b82f6',
                          }}
                        >
                          Catch-all
                        </span>
                      )}
                      <button
                        onClick={() => deleteMailbox(domain.id, mb.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--mail-text-muted)',
                          padding: 4,
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add Mailbox Dialog */}
              <AnimatePresence>
                {addMailboxOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setAddMailboxOpen(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000,
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        maxWidth: 420,
                        background: 'var(--mail-bg)',
                        border: '1px solid var(--mail-border)',
                        borderRadius: 16,
                        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                        zIndex: 1001,
                        padding: 24,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--mail-text)' }}>
                          Add Mailbox
                        </h3>
                        <button
                          onClick={() => setAddMailboxOpen(false)}
                          style={{ background: 'none', border: 'none', color: 'var(--mail-text-muted)', cursor: 'pointer', display: 'flex' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <form onSubmit={handleAddMailbox}>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--mail-text-secondary)', display: 'block', marginBottom: 6 }}>
                            Email address
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <input
                              type="text"
                              value={mailboxLocal}
                              onChange={(e) => setMailboxLocal(e.target.value)}
                              placeholder="hello"
                              autoFocus
                              style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '10px 0 0 10px',
                                border: '1px solid var(--mail-border)',
                                borderRight: 'none',
                                background: 'var(--mail-bg-secondary)',
                                color: 'var(--mail-text)',
                                fontSize: 14,
                                outline: 'none',
                              }}
                            />
                            <span
                              style={{
                                padding: '10px 12px',
                                borderRadius: '0 10px 10px 0',
                                border: '1px solid var(--mail-border)',
                                background: 'var(--mail-bg-hover)',
                                color: 'var(--mail-text-muted)',
                                fontSize: 14,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              @{domain.domain}
                            </span>
                          </div>
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--mail-text-secondary)', display: 'block', marginBottom: 6 }}>
                            Display name (optional)
                          </label>
                          <input
                            type="text"
                            value={mailboxDisplay}
                            onChange={(e) => setMailboxDisplay(e.target.value)}
                            placeholder="Support Team"
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: '1px solid var(--mail-border)',
                              background: 'var(--mail-bg-secondary)',
                              color: 'var(--mail-text)',
                              fontSize: 14,
                              outline: 'none',
                            }}
                          />
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={mailboxCatchAll}
                            onChange={(e) => setMailboxCatchAll(e.target.checked)}
                            style={{ accentColor: 'var(--mail-brand)' }}
                          />
                          <span style={{ fontSize: 13, color: 'var(--mail-text-secondary)' }}>
                            Catch-all (receive all unmatched mail)
                          </span>
                        </label>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => setAddMailboxOpen(false)}
                            style={{
                              padding: '9px 16px',
                              borderRadius: 10,
                              border: '1px solid var(--mail-border)',
                              background: 'transparent',
                              color: 'var(--mail-text-secondary)',
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={mailboxLoading || !mailboxLocal.trim()}
                            style={{
                              padding: '9px 20px',
                              borderRadius: 10,
                              border: 'none',
                              background: 'var(--mail-brand)',
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              opacity: !mailboxLocal.trim() ? 0.5 : 1,
                            }}
                          >
                            {mailboxLoading && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                            Add
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Activity Logs Tab */}
          {tab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {dnsLogsLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Loader2 size={20} color="var(--mail-brand)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : dnsLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    background: 'var(--mail-bg-secondary)',
                    border: '1px dashed var(--mail-border)',
                    borderRadius: 12,
                  }}
                >
                  <Activity size={28} color="var(--mail-text-muted)" style={{ marginBottom: 12 }} />
                  <p style={{ fontSize: 14, color: 'var(--mail-text-muted)', margin: 0 }}>
                    No DNS check logs yet. Click "Verify DNS" to trigger a check.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {dnsLogs.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 14px',
                        background: 'var(--mail-bg-secondary)',
                        border: '1px solid var(--mail-border)',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: log.passed ? '#30a46c' : '#e5484d',
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontWeight: 600,
                          color: 'var(--mail-text)',
                          textTransform: 'uppercase',
                          fontSize: 11,
                          letterSpacing: '0.05em',
                          width: 50,
                        }}
                      >
                        {log.checkType}
                      </span>
                      <span style={{ flex: 1, color: 'var(--mail-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.passed ? 'Passed' : `Failed: ${log.actualValue}`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--mail-text-muted)', flexShrink: 0 }}>
                        {new Date(log.checkedAt).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {deleteConfirm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirm(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 1000,
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  maxWidth: 380,
                  background: 'var(--mail-bg)',
                  border: '1px solid var(--mail-border)',
                  borderRadius: 16,
                  boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
                  zIndex: 1001,
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(229, 72, 77, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <Trash2 size={24} color="#e5484d" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 8px', color: 'var(--mail-text)' }}>
                  Delete {domain.domain}?
                </h3>
                <p style={{ fontSize: 13, color: 'var(--mail-text-muted)', margin: '0 0 20px' }}>
                  This will permanently remove the domain, all DNS settings, DKIM keys, and associated mailboxes.
                </p>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 10,
                      border: '1px solid var(--mail-border)',
                      background: 'transparent',
                      color: 'var(--mail-text-secondary)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 10,
                      border: 'none',
                      background: '#e5484d',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete Domain
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
