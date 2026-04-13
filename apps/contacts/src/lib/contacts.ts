import type {
  ContactAddress,
  ContactEvent,
  ContactPayload,
  ContactRelationship,
  DecryptedContact,
  LabeledField,
} from '@/types/contacts';

const CONTACT_SCHEMA_VERSION = 1;

export function createEmptyLabeledField(label: string): LabeledField {
  return {
    label,
    customLabel: '',
    value: '',
    isPrimary: false,
  };
}

export function createEmptyAddress(): ContactAddress {
  return {
    label: 'home',
    customLabel: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    isPrimary: false,
  };
}

export function createEmptyRelationship(): ContactRelationship {
  return {
    label: 'spouse',
    customLabel: '',
    name: '',
  };
}

export function createEmptyEvent(): ContactEvent {
  return {
    label: 'birthday',
    customLabel: '',
    dateIso: '',
  };
}

export function createEmptyContactPayload(): ContactPayload {
  const now = new Date().toISOString();
  return {
    schemaVersion: CONTACT_SCHEMA_VERSION,
    name: {
      displayName: '',
      givenName: '',
      middleName: '',
      familyName: '',
      prefix: '',
      suffix: '',
    },
    emails: [{ ...createEmptyLabeledField('work'), isPrimary: true }],
    phones: [{ ...createEmptyLabeledField('mobile'), isPrimary: true }],
    addresses: [],
    labels: [],
    relationships: [],
    events: [],
    company: '',
    jobTitle: '',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeContactPayload(payload: ContactPayload, previousCreatedAt?: string): ContactPayload {
  const now = new Date().toISOString();
  const normalizedName = {
    displayName: payload.name.displayName.trim(),
    givenName: payload.name.givenName.trim(),
    middleName: payload.name.middleName.trim(),
    familyName: payload.name.familyName.trim(),
    prefix: payload.name.prefix.trim(),
    suffix: payload.name.suffix.trim(),
  };

  const emails = normalizePrimaryFields(payload.emails);
  const phones = normalizePrimaryFields(payload.phones);
  const addresses = normalizeAddresses(payload.addresses);
  const relationships = payload.relationships
    .map((relationship) => ({
      label: relationship.label,
      customLabel: relationship.customLabel.trim(),
      name: relationship.name.trim(),
    }))
    .filter((relationship) => relationship.name.length > 0);
  const events = payload.events
    .map((event) => ({
      label: event.label,
      customLabel: event.customLabel.trim(),
      dateIso: event.dateIso.trim(),
    }))
    .filter((event) => event.dateIso.length > 0);

  const displayName =
    normalizedName.displayName ||
    [normalizedName.prefix, normalizedName.givenName, normalizedName.middleName, normalizedName.familyName, normalizedName.suffix]
      .filter(Boolean)
      .join(' ')
      .trim();

  return {
    ...payload,
    schemaVersion: CONTACT_SCHEMA_VERSION,
    name: {
      ...normalizedName,
      displayName,
    },
    emails,
    phones,
    addresses,
    relationships,
    events,
    labels: payload.labels.map((label) => label.trim()).filter(Boolean),
    company: payload.company.trim(),
    jobTitle: payload.jobTitle.trim(),
    notes: payload.notes.trim(),
    createdAt: previousCreatedAt ?? payload.createdAt ?? now,
    updatedAt: now,
  };
}

function normalizePrimaryFields(fields: LabeledField[]): LabeledField[] {
  const trimmed = fields
    .map((field) => ({
      label: field.label,
      customLabel: field.customLabel.trim(),
      value: field.value.trim(),
      isPrimary: field.isPrimary,
    }))
    .filter((field) => field.value.length > 0);

  if (trimmed.length === 0) {
    return [];
  }

  return trimmed.map((field, index) => ({
    ...field,
    isPrimary: index === 0 ? true : field.isPrimary && !trimmed.some((candidate, candidateIndex) => candidateIndex < index && candidate.isPrimary),
  }));
}

function normalizeAddresses(addresses: ContactAddress[]): ContactAddress[] {
  const filtered = addresses
    .map((address) => ({
      ...address,
      customLabel: address.customLabel.trim(),
      streetLine1: address.streetLine1.trim(),
      streetLine2: address.streetLine2.trim(),
      city: address.city.trim(),
      region: address.region.trim(),
      postalCode: address.postalCode.trim(),
      country: address.country.trim(),
    }))
    .filter((address) =>
      [
        address.streetLine1,
        address.streetLine2,
        address.city,
        address.region,
        address.postalCode,
        address.country,
      ].some(Boolean),
    );

  if (filtered.length === 0) {
    return [];
  }

  return filtered.map((address, index) => ({
    ...address,
    isPrimary:
      index === 0
        ? true
        : address.isPrimary && !filtered.some((candidate, candidateIndex) => candidateIndex < index && candidate.isPrimary),
  }));
}

export function buildSearchIndex(payload: ContactPayload): string {
  return [
    payload.name.displayName,
    payload.name.givenName,
    payload.name.familyName,
    payload.company,
    payload.jobTitle,
    payload.notes,
    payload.labels.join(' '),
    payload.emails.map((email) => email.value).join(' '),
    payload.phones.map((phone) => phone.value).join(' '),
    payload.addresses
      .map((address) =>
        [
          address.streetLine1,
          address.streetLine2,
          address.city,
          address.region,
          address.postalCode,
          address.country,
        ].join(' '),
      )
      .join(' '),
    payload.relationships.map((relationship) => relationship.name).join(' '),
    payload.events.map((event) => event.dateIso).join(' '),
  ]
    .join(' ')
    .toLowerCase();
}

export function getPrimaryField(fields: LabeledField[]): string {
  return fields.find((field) => field.isPrimary)?.value ?? fields[0]?.value ?? '';
}

export function getPrimaryAddress(addresses: ContactAddress[]): string {
  const address = addresses.find((item) => item.isPrimary) ?? addresses[0];
  if (!address) {
    return '';
  }

  return [
    address.streetLine1,
    address.streetLine2,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(', ');
}

export function sortContacts(contacts: DecryptedContact[]): DecryptedContact[] {
  return [...contacts].sort((left, right) => {
    const leftName = left.payload.name.displayName || getPrimaryField(left.payload.emails) || left.id;
    const rightName = right.payload.name.displayName || getPrimaryField(right.payload.emails) || right.id;
    return leftName.localeCompare(rightName);
  });
}
