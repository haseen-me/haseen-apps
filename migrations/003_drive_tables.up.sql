-- Haseen: Drive tables
-- Encrypted file storage

-- ====================
-- Folders
-- ====================
CREATE TABLE drive_folders (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drive_folders_owner ON drive_folders(owner_id);
CREATE INDEX idx_drive_folders_parent ON drive_folders(parent_id);

-- ====================
-- Files (encrypted metadata + reference to blob)
-- ====================
CREATE TABLE drive_files (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    folder_id               UUID REFERENCES drive_folders(id) ON DELETE SET NULL,
    name                    TEXT NOT NULL,
    mime_type               TEXT NOT NULL,
    size                    BIGINT NOT NULL,
    encrypted_metadata      BYTEA,
    encrypted_content_key   BYTEA NOT NULL,
    blob_path               TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_drive_files_owner ON drive_files(owner_id);
CREATE INDEX idx_drive_files_folder ON drive_files(folder_id);

-- ====================
-- Sharing
-- ====================
CREATE TABLE drive_shares (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id         UUID REFERENCES drive_files(id) ON DELETE CASCADE,
    folder_id       UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
    shared_with     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encrypted_key   BYTEA NOT NULL,
    permission      TEXT NOT NULL DEFAULT 'read',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT share_target CHECK (
        (file_id IS NOT NULL AND folder_id IS NULL) OR
        (file_id IS NULL AND folder_id IS NOT NULL)
    )
);

CREATE INDEX idx_drive_shares_file ON drive_shares(file_id);
CREATE INDEX idx_drive_shares_folder ON drive_shares(folder_id);
CREATE INDEX idx_drive_shares_user ON drive_shares(shared_with);
