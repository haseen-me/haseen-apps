export interface CustomDomain {
  id: string;
  userId: string;
  domain: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  verificationToken: string;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DNSRecord {
  type: string;
  host: string;
  value: string;
  verified: boolean;
}

export interface DomainDNSRecords {
  mx: DNSRecord;
  spf: DNSRecord;
  dkim: DNSRecord;
  dmarc: DNSRecord;
}

export interface DomainMailbox {
  id: string;
  domainId: string;
  userId: string;
  localPart: string;
  displayName: string;
  isCatchAll: boolean;
  createdAt: string;
}

export interface DomainResponse {
  domain: CustomDomain;
  dnsRecords: DomainDNSRecords;
  mailboxes: DomainMailbox[];
}

export interface DNSCheckLog {
  id: string;
  domainId: string;
  checkType: 'mx' | 'spf' | 'dkim' | 'dmarc';
  passed: boolean;
  expectedValue: string;
  actualValue: string;
  checkedAt: string;
}
