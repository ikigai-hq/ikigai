-- This file should undo anything in `up.sql`
ALTER TABLE space_members
    DROP COLUMN role;
