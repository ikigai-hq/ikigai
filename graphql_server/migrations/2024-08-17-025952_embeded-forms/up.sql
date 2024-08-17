-- Your SQL goes here
CREATE TABLE embedded_sessions (
    session_id UUID PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    embedded_type INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);

CREATE TABLE embedded_form_responses (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES embedded_sessions(session_id) ON DELETE CASCADE,
    submission_id INT REFERENCES assignment_submissions(id) ON DELETE SET NULL,
    response_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL DEFAULT '{}',
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);
