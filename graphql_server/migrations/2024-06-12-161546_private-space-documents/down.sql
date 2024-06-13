-- This file should undo anything in `up.sql`
ALTER TABLE documents
    DROP COLUMN is_private,
    DROP COLUMN is_default_folder_private;
