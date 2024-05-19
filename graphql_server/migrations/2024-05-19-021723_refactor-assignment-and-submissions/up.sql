-- Your SQL goes here
ALTER TABLE assignments
    DROP COLUMN graded_type,
    DROP COLUMN weighting_into_final_grade,
    DROP COLUMN allow_submission_change_structure;

ALTER TABLE assignment_submissions
    RENAME COLUMN temp_grade TO auto_grade;

ALTER TABLE assignment_submissions
    DROP COLUMN can_change_structure;
