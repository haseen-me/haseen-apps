-- Haseen: Mail schema enhancements
-- Add missing columns for API support, full-text search

-- Message metadata (plaintext for search/display alongside encrypted blobs)
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS bcc_addresses TEXT[];
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT '';
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS body_html TEXT NOT NULL DEFAULT '';
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS body_text TEXT NOT NULL DEFAULT '';
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS message_id_header TEXT;  -- RFC 5322 Message-ID for threading

-- Full-text search vector (auto-populated by trigger)
ALTER TABLE mail_messages ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;
CREATE INDEX IF NOT EXISTS idx_mail_messages_search ON mail_messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_mail_messages_starred ON mail_messages(starred) WHERE starred = TRUE;
CREATE INDEX IF NOT EXISTS idx_mail_messages_msgid ON mail_messages(message_id_header) WHERE message_id_header IS NOT NULL;

-- Auto-update search vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION mail_messages_search_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.from_address, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.to_addresses, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.body_text, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mail_messages_search_update ON mail_messages;
CREATE TRIGGER mail_messages_search_update
  BEFORE INSERT OR UPDATE ON mail_messages
  FOR EACH ROW EXECUTE FUNCTION mail_messages_search_trigger();
