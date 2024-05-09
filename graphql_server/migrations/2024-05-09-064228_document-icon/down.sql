-- This file should undo anything in `up.sql`
ALTER TABLE documents
    DROP COLUMN icon_type,
    DROP COLUMN icon_value;
