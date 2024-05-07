-- Your SQL goes here
CREATE TABLE pages (
    id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id),
    index INT NOT NULL,
    title TEXT NOT NULL,
    layout INT NOT NULL DEFAULT 0,
    created_by_id INT NOT NULL REFERENCES users(id),
    deleted_at BIGINT,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);

CREATE TABLE page_contents (
    id UUID PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES pages(id),
    index INT NOT NULL,
    body TEXT NOT NULL,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
)
