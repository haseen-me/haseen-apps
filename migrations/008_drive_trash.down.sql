DROP INDEX IF EXISTS idx_drive_folders_deleted;
DROP INDEX IF EXISTS idx_drive_files_deleted;
ALTER TABLE drive_folders DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE drive_files DROP COLUMN IF EXISTS deleted_at;
