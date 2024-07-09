-- Your SQL goes here
CREATE TABLE quiz_blocks (
    id UUID PRIMARY KEY,
    page_content_id UUID NOT NULL REFERENCES page_contents(id) ON DELETE CASCADE,
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_quiz_id UUID REFERENCES quiz_blocks(id) ON DELETE SET NULL,
    quiz_type INT NOT NULL,
    question_data JSONB NOT NULL,
    answer_data JSONB NOT NULL,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);

CREATE TABLE quiz_user_answer (
    quiz_id UUID NOT NULL REFERENCES quiz_blocks(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answer_data JSONB NOT NULL,
    score FLOAT NOT NULL,
    updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    PRIMARY KEY (quiz_id, user_id)
);
