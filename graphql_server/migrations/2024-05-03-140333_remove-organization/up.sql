-- Your SQL goes here
ALTER TABLE band_scores
    DROP COLUMN org_id;
ALTER TABLE documents
    DROP COLUMN org_id;
ALTER TABLE files
    DROP COLUMN org_id;
ALTER TABLE quiz_structures
    DROP COLUMN org_id;
ALTER TABLE rubrics
    DROP COLUMN org_id,
    ADD COLUMN user_id INT NOT NULL REFERENCES users(id);
ALTER TABLE spaces
    DROP COLUMN org_id;

DROP TABLE organization_members;
DROP TABLE organizations;
