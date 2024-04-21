-- Your SQL goes here
ALTER TABLE files
    DROP COLUMN transcoding_output_key,
    DROP COLUMN transcoding_output_content_type,
    DROP COLUMN transcoding_output_content_length;
