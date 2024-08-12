-- Your SQL goes here
ALTER TABLE users
    ADD COLUMN account_type INT NOT NULL DEFAULT 0;
