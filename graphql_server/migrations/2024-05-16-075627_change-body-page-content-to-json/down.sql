-- This file should undo anything in `up.sql`
ALTER TABLE page_contents
    DROP COLUMN body;

ALTER TABLE page_contents
    ADD COLUMN body TEXT NOT NULL DEFAULT '';
