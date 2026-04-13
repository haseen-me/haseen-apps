-- Haseen: inbound mail metadata and threading support

ALTER TABLE mail_messages
  ADD COLUMN IF NOT EXISTS envelope_from TEXT,
  ADD COLUMN IF NOT EXISTS in_reply_to_header TEXT,
  ADD COLUMN IF NOT EXISTS references_header TEXT[],
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_mail_messages_in_reply_to
  ON mail_messages(in_reply_to_header)
  WHERE in_reply_to_header IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mail_messages_received_at
  ON mail_messages(mailbox_id, received_at DESC);
