-- Haseen: Mail tables
-- Encrypted mail storage

-- ====================
-- Mailboxes
-- ====================
CREATE TABLE mailboxes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_mailboxes_user ON mailboxes(user_id);

-- ====================
-- Labels
-- ====================
CREATE TABLE mail_labels (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id  UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    color       TEXT,
    is_system   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_labels_mailbox ON mail_labels(mailbox_id);

-- ====================
-- Threads
-- ====================
CREATE TABLE mail_threads (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mailbox_id  UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_threads_mailbox ON mail_threads(mailbox_id);
CREATE INDEX idx_mail_threads_updated ON mail_threads(updated_at DESC);

-- ====================
-- Messages (encrypted)
-- ====================
CREATE TABLE mail_messages (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id               UUID NOT NULL REFERENCES mail_threads(id) ON DELETE CASCADE,
    mailbox_id              UUID NOT NULL REFERENCES mailboxes(id) ON DELETE CASCADE,
    from_address            TEXT NOT NULL,
    to_addresses            TEXT[] NOT NULL,
    cc_addresses            TEXT[],
    encrypted_subject       BYTEA NOT NULL,
    encrypted_body          BYTEA NOT NULL,
    encrypted_session_key   BYTEA NOT NULL,
    is_read                 BOOLEAN NOT NULL DEFAULT FALSE,
    label_id                UUID REFERENCES mail_labels(id),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_messages_thread ON mail_messages(thread_id);
CREATE INDEX idx_mail_messages_mailbox ON mail_messages(mailbox_id, created_at DESC);
CREATE INDEX idx_mail_messages_label ON mail_messages(label_id) WHERE label_id IS NOT NULL;

-- ====================
-- Attachments (encrypted)
-- ====================
CREATE TABLE mail_attachments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id      UUID NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    filename        TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    size            BIGINT NOT NULL,
    encrypted_data  BYTEA NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_attachments_message ON mail_attachments(message_id);
