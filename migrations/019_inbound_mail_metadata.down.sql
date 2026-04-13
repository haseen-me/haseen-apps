DROP INDEX IF EXISTS idx_mail_messages_received_at;
DROP INDEX IF EXISTS idx_mail_messages_in_reply_to;

ALTER TABLE mail_messages
  DROP COLUMN IF EXISTS received_at,
  DROP COLUMN IF EXISTS references_header,
  DROP COLUMN IF EXISTS in_reply_to_header,
  DROP COLUMN IF EXISTS envelope_from;
