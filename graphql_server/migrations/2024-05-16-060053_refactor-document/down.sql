-- This file should undo anything in `up.sql`
ALTER TABLE documents
    ADD COLUMN body TEXT NOT NULL DEFAULT '',
    ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN editor_config JSONB NOT NULL DEFAULT '{}';

create table threads
(
    id         serial
        primary key,
    creator_id integer                                                  not null
        references users
            on delete cascade,
    title      varchar(256) default ''::character varying               not null,
    updated_at bigint       default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint       default (EXTRACT(epoch FROM now()))::bigint not null
);

create table thread_comments
(
    id           bigserial
        primary key,
    thread_id    integer                                             not null
        references threads
            on delete cascade,
    sender_id    integer                                             not null
        references users
            on delete cascade,
    content      text                                                not null,
    updated_at   bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at   bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    comment_type integer default 0                                   not null,
    file_uuid    uuid
        references files
            on delete cascade
);

create table quiz_structures
(
    id          uuid                                                not null
        primary key,
    user_id     integer                                             not null
        references users,
    quiz_type   integer default 0                                   not null,
    quiz_title  text                                                not null,
    quiz_body   jsonb                                               not null,
    quiz_answer jsonb                                               not null,
    updated_at  bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at  bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    org_id      integer default 1                                   not null
        references organizations,
    explanation text    default ''::text                            not null
);

create table quizzes
(
    id                uuid                                               not null
        primary key,
    document_id       uuid                                               not null
        references documents
            on delete cascade,
    quiz_structure_id uuid                                               not null
        references quiz_structures
            on delete cascade,
    created_at        bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    deleted_at        bigint
);

create table quiz_answers
(
    quiz_id    uuid                                               not null
        references quizzes
            on delete cascade,
    user_id    integer                                            not null
        references users,
    answer     jsonb                                              not null,
    score      double precision                                   not null,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    primary key (quiz_id, user_id)
);

create table document_highlights
(
    document_id    uuid                                                not null
        references documents
            on delete cascade,
    creator_id     integer                                             not null
        references users
            on delete cascade,
    thread_id      integer                                             not null
        references threads
            on delete cascade,
    from_pos       integer                                             not null,
    to_pos         integer                                             not null,
    updated_at     bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at     bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    uuid           uuid                                                not null
        primary key,
    highlight_type integer default 0                                   not null,
    original_text  text    default ''::text                            not null
);

create table document_page_blocks
(
    id          uuid                                                not null
        primary key,
    document_id uuid                                                not null
        references documents
            on delete cascade,
    title       text                                                not null,
    view_mode   integer default 0                                   not null,
    updated_at  bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at  bigint  default (EXTRACT(epoch FROM now()))::bigint not null
);

create table document_page_block_nested_documents
(
    page_block_id uuid                                               not null
        references document_page_blocks
            on delete cascade,
    document_id   uuid                                               not null
        references documents
            on delete cascade,
    index         integer                                            not null,
    created_at    bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    primary key (page_block_id, document_id)
);
