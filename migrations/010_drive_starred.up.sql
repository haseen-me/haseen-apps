ALTER TABLE drive_files ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_drive_files_starred ON drive_files (owner_id, starred) WHERE starred = true AND deleted_at IS NULL;
