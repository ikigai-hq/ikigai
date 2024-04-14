-- Your SQL goes here
ALTER TABLE classes
    RENAME TO spaces;

ALTER TABLE class_members
    RENAME to space_members;

ALTER TABLE space_members
    RENAME class_id TO space_id;

ALTER TABLE class_documents
    RENAME to space_documents;

ALTER TABLE space_documents
    RENAME class_id TO space_id;
