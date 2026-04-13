-- Ensure deterministic system label creation
-- Required for INSERT ... ON CONFLICT DO NOTHING in mail service

CREATE UNIQUE INDEX IF NOT EXISTS idx_mail_labels_mailbox_name_unique
  ON mail_labels (mailbox_id, name);

