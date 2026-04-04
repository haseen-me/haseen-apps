-- Add soft-delete support to drive_files and drive_folders
ALTER TABLE drive_files ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE drive_folders ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX idx_drive_files_deleted ON drive_files (owner_id) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_drive_folders_deleted ON drive_folders (owner_id) WHERE deleted_at IS NOT NULL;
