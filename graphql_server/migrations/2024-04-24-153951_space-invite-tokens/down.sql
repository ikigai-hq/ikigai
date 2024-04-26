-- This file should undo anything in `up.sql`
ALTER TABLE space_members
    DROP COLUMN join_by_token;

DROP TABLE space_invite_tokens;
