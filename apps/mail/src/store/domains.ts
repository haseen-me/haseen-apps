import { create } from 'zustand';
import type { CustomDomain, DomainResponse, DomainMailbox, DomainDNSRecords, DNSCheckLog } from '@/types/domain';
import { domainsApi } from '@/api/domains';

interface DomainsState {
  domains: CustomDomain[];
  loading: boolean;
  error: string | null;

  activeDomainId: string | null;
  activeDomain: DomainResponse | null;
  activeDomainLoading: boolean;

  dnsLogs: DNSCheckLog[];
  dnsLogsLoading: boolean;

  view: 'list' | 'detail' | 'add';

  fetchDomains: () => Promise<void>;
  fetchDomain: (id: string) => Promise<void>;
  addDomain: (domain: string) => Promise<DomainResponse>;
  deleteDomain: (id: string) => Promise<void>;
  verifyDomain: (id: string) => Promise<void>;
  fetchDNSLogs: (id: string) => Promise<void>;

  addMailbox: (domainId: string, localPart: string, displayName: string, isCatchAll: boolean) => Promise<void>;
  deleteMailbox: (domainId: string, mailboxId: string) => Promise<void>;

  setView: (view: 'list' | 'detail' | 'add') => void;
  setActiveDomainId: (id: string | null) => void;
}

export const useDomainsStore = create<DomainsState>((set, get) => ({
  domains: [],
  loading: false,
  error: null,

  activeDomainId: null,
  activeDomain: null,
  activeDomainLoading: false,

  dnsLogs: [],
  dnsLogsLoading: false,

  view: 'list',

  fetchDomains: async () => {
    set({ loading: true, error: null });
    try {
      const domains = await domainsApi.list();
      set({ domains, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  fetchDomain: async (id: string) => {
    set({ activeDomainLoading: true, activeDomainId: id });
    try {
      const data = await domainsApi.get(id);
      set({ activeDomain: data, activeDomainLoading: false });
    } catch {
      set({ activeDomainLoading: false });
    }
  },

  addDomain: async (domain: string) => {
    const data = await domainsApi.add(domain);
    set((s) => ({
      domains: [data.domain, ...s.domains],
      activeDomain: data,
      activeDomainId: data.domain.id,
      view: 'detail',
    }));
    return data;
  },

  deleteDomain: async (id: string) => {
    await domainsApi.delete(id);
    set((s) => ({
      domains: s.domains.filter((d) => d.id !== id),
      activeDomainId: null,
      activeDomain: null,
      view: 'list',
    }));
  },

  verifyDomain: async (id: string) => {
    const updated = await domainsApi.verify(id);
    set((s) => ({
      domains: s.domains.map((d) => (d.id === id ? updated : d)),
      activeDomain: s.activeDomain
        ? { ...s.activeDomain, domain: updated }
        : null,
    }));
  },

  fetchDNSLogs: async (id: string) => {
    set({ dnsLogsLoading: true });
    try {
      const logs = await domainsApi.getDNSLogs(id);
      set({ dnsLogs: logs, dnsLogsLoading: false });
    } catch {
      set({ dnsLogsLoading: false });
    }
  },

  addMailbox: async (domainId: string, localPart: string, displayName: string, isCatchAll: boolean) => {
    const mailbox = await domainsApi.addMailbox(domainId, localPart, displayName, isCatchAll);
    set((s) => ({
      activeDomain: s.activeDomain
        ? { ...s.activeDomain, mailboxes: [...s.activeDomain.mailboxes, mailbox] }
        : null,
    }));
  },

  deleteMailbox: async (domainId: string, mailboxId: string) => {
    await domainsApi.deleteMailbox(domainId, mailboxId);
    set((s) => ({
      activeDomain: s.activeDomain
        ? {
            ...s.activeDomain,
            mailboxes: s.activeDomain.mailboxes.filter((m) => m.id !== mailboxId),
          }
        : null,
    }));
  },

  setView: (view) => set({ view }),
  setActiveDomainId: (id) => set({ activeDomainId: id }),
}));
