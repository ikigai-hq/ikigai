-- Your SQL goes here
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    notification_type INT NOT NULL,
    context JSONB NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL
);

CREATE TABLE notification_receivers (
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE ,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    PRIMARY KEY (notification_id, user_id)
);
