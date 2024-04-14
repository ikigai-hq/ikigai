-- Your SQL goes here
ALTER TABLE documents
    ADD COLUMN space_id INT REFERENCES spaces(id) ON DELETE CASCADE;

DROP TABLE space_documents;
