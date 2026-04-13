export interface LabeledField {
  label: string;
  customLabel: string;
  value: string;
  isPrimary: boolean;
}

export interface ContactAddress {
  label: string;
  customLabel: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface ContactRelationship {
  label: string;
  customLabel: string;
  name: string;
}

export interface ContactEvent {
  label: string;
  customLabel: string;
  dateIso: string;
}

export interface ContactName {
  displayName: string;
  givenName: string;
  middleName: string;
  familyName: string;
  prefix: string;
  suffix: string;
}

export interface ContactPayload {
  schemaVersion: number;
  name: ContactName;
  emails: LabeledField[];
  phones: LabeledField[];
  addresses: ContactAddress[];
  labels: string[];
  relationships: ContactRelationship[];
  events: ContactEvent[];
  company: string;
  jobTitle: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EncryptedContactRecord {
  id: string;
  encryptedData: string;
  createdAt: string;
  updatedAt: string;
}

export interface DecryptedContact extends EncryptedContactRecord {
  payload: ContactPayload;
  searchIndex: string;
}

export interface ToastState {
  message: string;
  visible: boolean;
}

export const EMAIL_LABEL_OPTIONS = ['home', 'work', 'other', 'custom'] as const;
export const PHONE_LABEL_OPTIONS = ['mobile', 'work', 'home', 'other', 'custom'] as const;
export const ADDRESS_LABEL_OPTIONS = ['home', 'work', 'other', 'custom'] as const;
export const RELATIONSHIP_LABEL_OPTIONS = ['spouse', 'partner', 'manager', 'assistant', 'custom'] as const;
export const EVENT_LABEL_OPTIONS = ['birthday', 'anniversary', 'other', 'custom'] as const;
