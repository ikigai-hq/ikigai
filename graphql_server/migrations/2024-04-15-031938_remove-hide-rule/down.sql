-- This file should undo anything in `up.sql`
ALTER TABLE documents
    ADD COLUMN hide_rule INT NOT NULL DEFAULT 0;
