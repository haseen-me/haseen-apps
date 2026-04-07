-- Add display_name to users table
ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT '';
