-- Your SQL goes here
ALTER TABLE documents
    ADD COLUMN icon_type INT,
    ADD COLUMN icon_value VARCHAR(128);
