-- This file should undo anything in `up.sql`
ALTER TABLE space_documents
    RENAME to class_documents;

ALTER TABLE class_documents
    RENAME space_id to class_id;

ALTER TABLE space_members
    RENAME to class_members;

ALTER TABLE class_members
    RENAME space_id TO class_id;

ALTER TABLE spaces
    RENAME TO classes;
