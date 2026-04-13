import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Banner, Button, Dialog, Input, InputField, InputType, Select, TextArea, Typography } from '@haseen-me/ui';
import { Size, Type, TypographySize, TypographyWeight } from '@haseen-me/ui';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import {
  ADDRESS_LABEL_OPTIONS,
  EMAIL_LABEL_OPTIONS,
  EVENT_LABEL_OPTIONS,
  PHONE_LABEL_OPTIONS,
  RELATIONSHIP_LABEL_OPTIONS,
  type ContactAddress,
  type ContactEvent,
  type ContactPayload,
  type ContactRelationship,
  type LabeledField,
} from '@/types/contacts';
import {
  createEmptyAddress,
  createEmptyContactPayload,
  createEmptyEvent,
  createEmptyLabeledField,
  createEmptyRelationship,
} from '@/lib/contacts';

interface ContactEditorDialogProps {
  open: boolean;
  initialValue: ContactPayload | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: ContactPayload) => Promise<void>;
}

export function ContactEditorDialog({
  open,
  initialValue,
  saving,
  onClose,
  onSave,
}: ContactEditorDialogProps) {
  const [draft, setDraft] = useState<ContactPayload>(createEmptyContactPayload());
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(initialValue ? structuredClone(initialValue) : createEmptyContactPayload());
    setExpanded(
      Boolean(
        initialValue &&
          (initialValue.company ||
            initialValue.jobTitle ||
            initialValue.addresses.length ||
            initialValue.relationships.length ||
            initialValue.events.length ||
            initialValue.notes ||
            initialValue.labels.length),
      ),
    );
    setError(null);
  }, [initialValue, open]);

  const canSave = useMemo(
    () =>
      draft.name.displayName.trim().length > 0 ||
      draft.emails.some((email) => email.value.trim().length > 0) ||
      draft.phones.some((phone) => phone.value.trim().length > 0),
    [draft],
  );

  const handleSubmit = async () => {
    if (!canSave) {
      setError('Add at least a name, one email, or one phone number.');
      return;
    }

    setError(null);
    await onSave(draft);
  };

  const baseOptions = (values: readonly string[]) =>
    values.map((value) => ({
      value,
      label: value === 'custom' ? 'Custom' : capitalize(value),
    }));

  const updateEmails = (updater: (current: LabeledField[]) => LabeledField[]) =>
    setDraft((current) => ({ ...current, emails: updater(current.emails) }));
  const updatePhones = (updater: (current: LabeledField[]) => LabeledField[]) =>
    setDraft((current) => ({ ...current, phones: updater(current.phones) }));
  const updateAddresses = (updater: (current: ContactAddress[]) => ContactAddress[]) =>
    setDraft((current) => ({ ...current, addresses: updater(current.addresses) }));
  const updateRelationships = (updater: (current: ContactRelationship[]) => ContactRelationship[]) =>
    setDraft((current) => ({ ...current, relationships: updater(current.relationships) }));
  const updateEvents = (updater: (current: ContactEvent[]) => ContactEvent[]) =>
    setDraft((current) => ({ ...current, events: updater(current.events) }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      width={760}
      title={initialValue ? 'Edit Contact' : 'New Contact'}
      description="Names, emails, phones, addresses, labels, relationships, and events are encrypted in the browser before they leave this device."
      actions={
        <>
          <Button type={Type.SECONDARY} size={Size.MEDIUM} onClick={onClose}>
            Cancel
          </Button>
          <Button type={Type.PRIMARY} size={Size.MEDIUM} onClick={() => void handleSubmit()} loading={saving} disabled={!canSave}>
            {initialValue ? 'Save changes' : 'Create contact'}
          </Button>
        </>
      }
    >
      {error ? <Banner color="error">{error}</Banner> : null}

      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <InputField label="Display name">
            <Input
              value={draft.name.displayName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: { ...current.name, displayName: event.target.value },
                }))
              }
              placeholder="e.g. Amina Rahman"
              autoFocus
            />
          </InputField>
          <InputField label="Company">
            <Input
              value={draft.company}
              onChange={(event) => setDraft((current) => ({ ...current, company: event.target.value }))}
              placeholder="Haseen"
            />
          </InputField>
          <InputField label="Given name">
            <Input
              value={draft.name.givenName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: { ...current.name, givenName: event.target.value },
                }))
              }
              placeholder="Amina"
            />
          </InputField>
          <InputField label="Family name">
            <Input
              value={draft.name.familyName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: { ...current.name, familyName: event.target.value },
                }))
              }
              placeholder="Rahman"
            />
          </InputField>
        </div>

        <FieldArraySection
          title="Emails"
          description="At least one primary email is recommended."
          addLabel="Add email"
          onAdd={() => updateEmails((current) => [...current, createEmptyLabeledField('work')])}
        >
          {draft.emails.map((field, index) => (
            <LabeledFieldRow
              key={`email-${index}`}
              options={baseOptions(EMAIL_LABEL_OPTIONS)}
              field={field}
              placeholder="name@example.com"
              inputType={InputType.EMAIL}
              onChange={(nextField) =>
                updateEmails((current) => current.map((candidate, candidateIndex) => (candidateIndex === index ? nextField : candidate)))
              }
              onRemove={() =>
                updateEmails((current) => current.filter((_, candidateIndex) => candidateIndex !== index))
              }
              canRemove={draft.emails.length > 1}
            />
          ))}
        </FieldArraySection>

        <FieldArraySection
          title="Phones"
          description="Add mobile, work, home, or custom phone numbers."
          addLabel="Add phone"
          onAdd={() => updatePhones((current) => [...current, createEmptyLabeledField('mobile')])}
        >
          {draft.phones.map((field, index) => (
            <LabeledFieldRow
              key={`phone-${index}`}
              options={baseOptions(PHONE_LABEL_OPTIONS)}
              field={field}
              placeholder="+880 1XXX-XXXXXX"
              inputType={InputType.TEL}
              onChange={(nextField) =>
                updatePhones((current) => current.map((candidate, candidateIndex) => (candidateIndex === index ? nextField : candidate)))
              }
              onRemove={() =>
                updatePhones((current) => current.filter((_, candidateIndex) => candidateIndex !== index))
              }
              canRemove={draft.phones.length > 1}
            />
          ))}
        </FieldArraySection>

        <Button
          type={Type.TERTIARY}
          size={Size.MEDIUM}
          onClick={() => setExpanded((current) => !current)}
          startIcon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          style={{ justifySelf: 'flex-start' }}
        >
          {expanded ? 'Hide extra fields' : 'Show more fields'}
        </Button>

        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gap: 16, paddingTop: 8 }}>
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <InputField label="Job title">
                    <Input
                      value={draft.jobTitle}
                      onChange={(event) => setDraft((current) => ({ ...current, jobTitle: event.target.value }))}
                      placeholder="Security Engineer"
                    />
                  </InputField>
                  <InputField label="Labels">
                    <Input
                      value={draft.labels.join(', ')}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          labels: event.target.value.split(',').map((item) => item.trim()).filter(Boolean),
                        }))
                      }
                      placeholder="friends, vendors, family"
                    />
                  </InputField>
                </div>

                <FieldArraySection
                  title="Addresses"
                  description="Structured addresses stay encrypted and searchable only after local decryption."
                  addLabel="Add address"
                  onAdd={() => updateAddresses((current) => [...current, createEmptyAddress()])}
                >
                  {draft.addresses.map((address, index) => (
                    <AddressRow
                      key={`address-${index}`}
                      address={address}
                      options={baseOptions(ADDRESS_LABEL_OPTIONS)}
                      onChange={(nextAddress) =>
                        updateAddresses((current) =>
                          current.map((candidate, candidateIndex) => (candidateIndex === index ? nextAddress : candidate)),
                        )
                      }
                      onRemove={() =>
                        updateAddresses((current) => current.filter((_, candidateIndex) => candidateIndex !== index))
                      }
                    />
                  ))}
                </FieldArraySection>

                <FieldArraySection
                  title="Relationships"
                  description="Model spouses, managers, assistants, and custom relationships."
                  addLabel="Add relationship"
                  onAdd={() => updateRelationships((current) => [...current, createEmptyRelationship()])}
                >
                  {draft.relationships.map((relationship, index) => (
                    <RelationshipRow
                      key={`relationship-${index}`}
                      relationship={relationship}
                      options={baseOptions(RELATIONSHIP_LABEL_OPTIONS)}
                      onChange={(nextRelationship) =>
                        updateRelationships((current) =>
                          current.map((candidate, candidateIndex) =>
                            candidateIndex === index ? nextRelationship : candidate,
                          ),
                        )
                      }
                      onRemove={() =>
                        updateRelationships((current) => current.filter((_, candidateIndex) => candidateIndex !== index))
                      }
                    />
                  ))}
                </FieldArraySection>

                <FieldArraySection
                  title="Events"
                  description="Store birthdays, anniversaries, and custom dates without exposing them to the server."
                  addLabel="Add event"
                  onAdd={() => updateEvents((current) => [...current, createEmptyEvent()])}
                >
                  {draft.events.map((event, index) => (
                    <EventRow
                      key={`event-${index}`}
                      event={event}
                      options={baseOptions(EVENT_LABEL_OPTIONS)}
                      onChange={(nextEvent) =>
                        updateEvents((current) =>
                          current.map((candidate, candidateIndex) => (candidateIndex === index ? nextEvent : candidate)),
                        )
                      }
                      onRemove={() =>
                        updateEvents((current) => current.filter((_, candidateIndex) => candidateIndex !== index))
                      }
                    />
                  ))}
                </FieldArraySection>

                <InputField label="Encrypted notes">
                  <TextArea
                    value={draft.notes}
                    onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                    rows={5}
                    placeholder="Private context, meeting notes, or account metadata."
                  />
                </InputField>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </Dialog>
  );
}

interface FieldArraySectionProps {
  title: string;
  description: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}

function FieldArraySection({ title, description, addLabel, onAdd, children }: FieldArraySectionProps) {
  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <Typography size={TypographySize.BODY} weight={TypographyWeight.SEMIBOLD}>
            {title}
          </Typography>
          <Typography size={TypographySize.CAPTION} style={{ color: 'var(--hsn-text-secondary)' }}>
            {description}
          </Typography>
        </div>
        <Button type={Type.SECONDARY} size={Size.SMALL} onClick={onAdd} startIcon={<Plus size={14} />}>
          {addLabel}
        </Button>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>{children}</div>
    </section>
  );
}

interface LabeledFieldRowProps {
  field: LabeledField;
  options: { value: string; label: string }[];
  placeholder: string;
  inputType: InputType;
  canRemove: boolean;
  onChange: (nextField: LabeledField) => void;
  onRemove: () => void;
}

function LabeledFieldRow({
  field,
  options,
  placeholder,
  inputType,
  canRemove,
  onChange,
  onRemove,
}: LabeledFieldRowProps) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '180px minmax(0, 1fr) auto' }}>
        <Select
          options={options}
          value={field.label}
          onChange={(value) => onChange({ ...field, label: value })}
        />
        <Input
          type={inputType}
          value={field.value}
          onChange={(event) => onChange({ ...field, value: event.target.value })}
          placeholder={placeholder}
        />
        <Button type={Type.TERTIARY} size={Size.SMALL} onClick={onRemove} disabled={!canRemove} startIcon={<Trash2 size={14} />}>
          Remove
        </Button>
      </div>
      {field.label === 'custom' ? (
        <Input
          value={field.customLabel}
          onChange={(event) => onChange({ ...field, customLabel: event.target.value })}
          placeholder="Custom label"
        />
      ) : null}
    </div>
  );
}

interface AddressRowProps {
  address: ContactAddress;
  options: { value: string; label: string }[];
  onChange: (nextAddress: ContactAddress) => void;
  onRemove: () => void;
}

function AddressRow({ address, options, onChange, onRemove }: AddressRowProps) {
  return (
    <div style={{ border: '1px solid var(--hsn-border-primary)', borderRadius: 8, padding: 12, display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '180px minmax(0, 1fr) auto' }}>
        <Select options={options} value={address.label} onChange={(value) => onChange({ ...address, label: value })} />
        <Input
          value={address.streetLine1}
          onChange={(event) => onChange({ ...address, streetLine1: event.target.value })}
          placeholder="Street line 1"
        />
        <Button type={Type.TERTIARY} size={Size.SMALL} onClick={onRemove} startIcon={<Trash2 size={14} />}>
          Remove
        </Button>
      </div>
      {address.label === 'custom' ? (
        <Input
          value={address.customLabel}
          onChange={(event) => onChange({ ...address, customLabel: event.target.value })}
          placeholder="Custom label"
        />
      ) : null}
      <Input
        value={address.streetLine2}
        onChange={(event) => onChange({ ...address, streetLine2: event.target.value })}
        placeholder="Street line 2"
      />
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
        <Input value={address.city} onChange={(event) => onChange({ ...address, city: event.target.value })} placeholder="City" />
        <Input
          value={address.region}
          onChange={(event) => onChange({ ...address, region: event.target.value })}
          placeholder="State / Region"
        />
        <Input
          value={address.postalCode}
          onChange={(event) => onChange({ ...address, postalCode: event.target.value })}
          placeholder="Postal code"
        />
        <Input
          value={address.country}
          onChange={(event) => onChange({ ...address, country: event.target.value })}
          placeholder="Country"
        />
      </div>
    </div>
  );
}

interface RelationshipRowProps {
  relationship: ContactRelationship;
  options: { value: string; label: string }[];
  onChange: (nextRelationship: ContactRelationship) => void;
  onRemove: () => void;
}

function RelationshipRow({ relationship, options, onChange, onRemove }: RelationshipRowProps) {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '180px minmax(0, 1fr) auto' }}>
      <Select
        options={options}
        value={relationship.label}
        onChange={(value) => onChange({ ...relationship, label: value })}
      />
      <Input
        value={relationship.name}
        onChange={(event) => onChange({ ...relationship, name: event.target.value })}
        placeholder="Relationship name"
      />
      <Button type={Type.TERTIARY} size={Size.SMALL} onClick={onRemove} startIcon={<Trash2 size={14} />}>
        Remove
      </Button>
      {relationship.label === 'custom' ? (
        <div style={{ gridColumn: '1 / span 2' }}>
          <Input
            value={relationship.customLabel}
            onChange={(event) => onChange({ ...relationship, customLabel: event.target.value })}
            placeholder="Custom label"
          />
        </div>
      ) : null}
    </div>
  );
}

interface EventRowProps {
  event: ContactEvent;
  options: { value: string; label: string }[];
  onChange: (nextEvent: ContactEvent) => void;
  onRemove: () => void;
}

function EventRow({ event, options, onChange, onRemove }: EventRowProps) {
  return (
    <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '180px minmax(0, 1fr) auto' }}>
      <Select options={options} value={event.label} onChange={(value) => onChange({ ...event, label: value })} />
      <Input
        type={InputType.TEXT}
        value={event.dateIso}
        onChange={(entry) => onChange({ ...event, dateIso: entry.target.value })}
        placeholder="YYYY-MM-DD"
      />
      <Button type={Type.TERTIARY} size={Size.SMALL} onClick={onRemove} startIcon={<Trash2 size={14} />}>
        Remove
      </Button>
      {event.label === 'custom' ? (
        <div style={{ gridColumn: '1 / span 2' }}>
          <Input
            value={event.customLabel}
            onChange={(entry) => onChange({ ...event, customLabel: entry.target.value })}
            placeholder="Custom label"
          />
        </div>
      ) : null}
    </div>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
