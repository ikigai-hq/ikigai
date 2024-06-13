-- Your SQL goes here
ALTER TABLE documents
    ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN is_default_folder_private BOOLEAN NOT NULL DEFAULT FALSE;
