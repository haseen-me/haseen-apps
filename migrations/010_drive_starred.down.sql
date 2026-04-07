DROP INDEX IF EXISTS idx_drive_files_starred;
ALTER TABLE drive_files DROP COLUMN IF EXISTS starred;
