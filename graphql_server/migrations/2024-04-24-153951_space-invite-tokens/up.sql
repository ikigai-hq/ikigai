-- Your SQL goes here
CREATE TABLE space_invite_tokens (
    space_id INT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    token VARCHAR(32) NOT NULL,
    creator_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inviting_role INT NOT NULL,
    expire_at BIGINT,
    uses INT NOT NULL,
    is_active BOOL NOT NULL,
    created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
    PRIMARY KEY (space_id, token)
);

ALTER TABLE space_members
    ADD COLUMN join_by_token VARCHAR(32);
