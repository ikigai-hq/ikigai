-- This file should undo anything in `up.sql`
ALTER TABLE assignment_submissions
    DROP COLUMN test_duration;

ALTER TABLE assignments
    ADD COLUMN force_auto_submit BOOLEAN NOT NULL DEFAULT FALSE;
