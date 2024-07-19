-- This file should undo anything in `up.sql`
ALTER TABLE documents
    DROP COLUMN visibility,
    ADD COLUMN is_default_folder_private BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
