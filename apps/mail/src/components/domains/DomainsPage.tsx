import { AnimatePresence, motion } from 'framer-motion';
import { useDomainsStore } from '@/store/domains';
import { DomainList } from './DomainList';
import { DomainDetail } from './DomainDetail';

export function DomainsPage() {
  const view = useDomainsStore((s) => s.view);

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        background: 'var(--hsn-bg-l1-solid)',
      }}
    >
      <AnimatePresence mode="wait">
        {view === 'detail' ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{ height: '100%' }}
          >
            <DomainDetail />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            style={{ height: '100%' }}
          >
            <DomainList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
