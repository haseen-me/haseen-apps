-- Rollback: Mail schema enhancements
DROP TRIGGER IF EXISTS mail_messages_search_update ON mail_messages;
DROP FUNCTION IF EXISTS mail_messages_search_trigger;
DROP INDEX IF EXISTS idx_mail_messages_msgid;
DROP INDEX IF EXISTS idx_mail_messages_starred;
DROP INDEX IF EXISTS idx_mail_messages_search;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS search_vector;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS message_id_header;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS body_text;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS body_html;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS subject;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS bcc_addresses;
ALTER TABLE mail_messages DROP COLUMN IF EXISTS starred;
