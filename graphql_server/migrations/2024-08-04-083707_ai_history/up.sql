-- Your SQL goes here
CREATE TABLE ai_history_sessions (
    id UUID PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action INT NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    user_reaction INT NOT NULL,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);
