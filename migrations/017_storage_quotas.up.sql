-- Haseen: Per-user storage quotas (mail + drive)
-- Used by admin panel to manage allocation limits.

CREATE TABLE IF NOT EXISTS storage_quotas (
    user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    mail_quota_bytes  BIGINT NOT NULL DEFAULT 0,
    drive_quota_bytes BIGINT NOT NULL DEFAULT 0,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_storage_quotas_updated ON storage_quotas(updated_at DESC);

