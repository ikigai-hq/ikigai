-- This file should undo anything in `up.sql`
ALTER TABLE users
    ADD COLUMN password TEXT NOT NULL DEFAULT '';
