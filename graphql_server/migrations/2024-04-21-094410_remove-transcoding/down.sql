-- This file should undo anything in `up.sql`
ALTER TABLE files
    ADD COLUMN transcoding_output_key varchar(128),
    ADD COLUMN transcoding_output_content_type VARCHAR(256),
    ADD COLUMN transcoding_output_content_length BIGINT;
