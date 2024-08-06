-- Your SQL goes here
CREATE TABLE tags (
    tag VARCHAR(256) PRIMARY KEY,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);

CREATE TABLE document_tags (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tag VARCHAR(256) NOT NULL REFERENCES tags(tag) ON DELETE CASCADE,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    PRIMARY KEY (document_id, tag)
);
