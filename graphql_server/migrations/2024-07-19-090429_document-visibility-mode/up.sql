-- Your SQL goes here
ALTER TABLE documents
    ADD COLUMN visibility INT NOT NULL DEFAULT 0,
    DROP COLUMN is_default_folder_private,
    DROP COLUMN is_private;
