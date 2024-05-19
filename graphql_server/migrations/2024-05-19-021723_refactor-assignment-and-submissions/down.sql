-- This file should undo anything in `up.sql`
ALTER TABLE assignments
    ADD COLUMN graded_type INT NOT NULL DEFAULT 0,
    ADD COLUMN weighting_into_final_grade FLOAT,
    ADD COLUMN allow_submission_change_structure BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE assignment_submissions
    RENAME COLUMN auto_grade TO temp_grade;

ALTER TABLE assignment_submissions
    ADD COLUMN can_change_structure BOOLEAN NOT NULL DEFAULT FALSE;
