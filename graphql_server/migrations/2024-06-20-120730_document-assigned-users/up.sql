-- Your SQL goes here
CREATE TABLE document_assigned_users (
     document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE ,
     assigned_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE ,
     created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM now()))::BIGINT NOT NULL,
     PRIMARY KEY (document_id, assigned_user_id)
)
