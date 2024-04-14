-- Your SQL goes here
CREATE TABLE user_activities (
    user_id INT PRIMARY KEY REFERENCES users(id),
    last_document_id UUID REFERENCES documents(id) ON DELETE SET NULL
);
