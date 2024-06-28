-- Your SQL goes here
CREATE TABLE writing_blocks (
    id UUID PRIMARY KEY,
    page_content_id UUID NOT NULL REFERENCES page_contents(id) ON DELETE CASCADE ,
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ,
    content JSONB NOT NULL,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);
