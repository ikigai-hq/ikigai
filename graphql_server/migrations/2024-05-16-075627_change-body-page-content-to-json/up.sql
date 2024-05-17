-- Your SQL goes here
ALTER TABLE page_contents
    DROP COLUMN body;

ALTER TABLE page_contents
    ADD COLUMN body JSONB NOT NULL DEFAULT '{}';
