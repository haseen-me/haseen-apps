-- Haseen: Custom domains for multi-tenant mail
-- Supports per-domain DKIM keys, DNS verification, and mailbox routing

-- ====================
-- Custom Domains
-- ====================
CREATE TABLE custom_domains (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain          TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'verifying', 'verified', 'failed')),
    mx_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    spf_verified    BOOLEAN NOT NULL DEFAULT FALSE,
    dkim_verified   BOOLEAN NOT NULL DEFAULT FALSE,
    dmarc_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token TEXT NOT NULL,
    last_checked_at TIMESTAMPTZ,
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_status ON custom_domains(status);

-- ====================
-- DKIM Keys (encrypted at rest with AES-GCM)
-- ====================
CREATE TABLE dkim_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id       UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
    selector        TEXT NOT NULL DEFAULT 'haseen',
    private_key_enc BYTEA NOT NULL,
    private_key_iv  BYTEA NOT NULL,
    public_key      TEXT NOT NULL,
    key_size        INT NOT NULL DEFAULT 2048,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    rotated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_dkim_keys_domain_selector ON dkim_keys(domain_id, selector);
CREATE INDEX idx_dkim_keys_active ON dkim_keys(domain_id) WHERE active = TRUE;

-- ====================
-- Domain Mailboxes (mapping addresses to users on custom domains)
-- ====================
CREATE TABLE domain_mailboxes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id       UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    local_part      TEXT NOT NULL,
    display_name    TEXT,
    is_catchall     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_domain_mailboxes_address ON domain_mailboxes(domain_id, local_part);
CREATE INDEX idx_domain_mailboxes_user ON domain_mailboxes(user_id);
CREATE INDEX idx_domain_mailboxes_domain ON domain_mailboxes(domain_id);

-- ====================
-- Outbound Mail Queue
-- ====================
CREATE TABLE outbound_queue (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    domain_id       UUID REFERENCES custom_domains(id),
    from_address    TEXT NOT NULL,
    to_addresses    TEXT[] NOT NULL,
    cc_addresses    TEXT[],
    bcc_addresses   TEXT[],
    subject         TEXT NOT NULL,
    body_html       TEXT NOT NULL DEFAULT '',
    body_text       TEXT NOT NULL DEFAULT '',
    raw_headers     JSONB,
    status          TEXT NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'deferred')),
    attempts        INT NOT NULL DEFAULT 0,
    max_attempts    INT NOT NULL DEFAULT 5,
    last_error      TEXT,
    next_retry_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbound_queue_status ON outbound_queue(status, next_retry_at)
    WHERE status IN ('queued', 'deferred');
CREATE INDEX idx_outbound_queue_user ON outbound_queue(user_id);

-- ====================
-- Mail Attachment References (R2 storage)
-- ====================
CREATE TABLE mail_attachment_refs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id      UUID NOT NULL REFERENCES mail_messages(id) ON DELETE CASCADE,
    filename        TEXT NOT NULL,
    mime_type       TEXT NOT NULL,
    size            BIGINT NOT NULL,
    r2_bucket       TEXT NOT NULL DEFAULT 'haseen-mail',
    r2_key          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mail_attachment_refs_message ON mail_attachment_refs(message_id);

-- ====================
-- DNS Check Log (audit trail)
-- ====================
CREATE TABLE dns_check_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain_id       UUID NOT NULL REFERENCES custom_domains(id) ON DELETE CASCADE,
    check_type      TEXT NOT NULL CHECK (check_type IN ('mx', 'spf', 'dkim', 'dmarc')),
    passed          BOOLEAN NOT NULL,
    expected_value  TEXT,
    actual_value    TEXT,
    checked_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dns_check_log_domain ON dns_check_log(domain_id, checked_at DESC);
