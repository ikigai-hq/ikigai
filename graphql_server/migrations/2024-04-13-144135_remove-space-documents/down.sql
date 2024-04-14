-- This file should undo anything in `up.sql`
ALTER TABLE documents
    DROP space_id;

CREATE TABLE space_documents (
    space_id integer                                            not null
     references spaces
         on delete cascade,
    document_id uuid                                               not null
     references documents
         on delete cascade,
    updated_at  bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at  bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    primary key (class_id, document_id)
);
