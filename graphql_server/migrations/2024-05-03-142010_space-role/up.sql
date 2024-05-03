-- Your SQL goes here
ALTER TABLE space_members
    ADD COLUMN role INT NOT NULL DEFAULT 0;
