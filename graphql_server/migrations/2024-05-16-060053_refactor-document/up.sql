-- Your SQL goes here
ALTER TABLE documents
    DROP COLUMN body,
    DROP COLUMN is_public,
    DROP COLUMN editor_config;

DROP TABLE document_page_block_nested_documents;
DROP TABLE document_page_blocks;
DROP TABLE document_highlights;
DROP TABLE quiz_answers;
DROP TABLE quizzes;
DROP TABLE quiz_structures;
DROP TABLE thread_comments;
DROP TABLE threads;
