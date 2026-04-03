-- Keyserver: Signed pre-keys for async E2E encryption

CREATE TABLE signed_pre_keys (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_id          INTEGER NOT NULL,
    public_key      BYTEA NOT NULL,
    signature       BYTEA NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signed_pre_keys_user ON signed_pre_keys(user_id) WHERE is_used = FALSE;
CREATE UNIQUE INDEX idx_signed_pre_keys_user_keyid ON signed_pre_keys(user_id, key_id);
