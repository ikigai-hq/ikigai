-- Your SQL goes here
ALTER TABLE assignment_submissions
    ADD COLUMN test_duration INT;

ALTER TABLE assignments
    DROP COLUMN force_auto_submit;
