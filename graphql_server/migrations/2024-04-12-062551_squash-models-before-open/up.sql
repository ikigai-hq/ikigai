-- Your SQL goes here
create table users (
                       id             serial
                           primary key,
                       email          varchar                                            not null
                           unique
                           constraint users_email_check
                               check ((email)::text = lower((email)::text)),
                       password       varchar                                            not null,
                       first_name     varchar(256)                                       not null,
                       last_name      varchar(256)                                       not null,
                       updated_at     bigint default (EXTRACT(epoch FROM now()))::bigint not null,
                       created_at     bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table organizations
(
    id         serial
        primary key,
    org_name   varchar(1028)                                      not null,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    owner_id   integer
                                                                  references users
                                                                      on delete set null
);

create table files
(
    uuid                              uuid                                                not null
        primary key,
    user_id                           integer                                             not null
        references users,
    status                            integer                                             not null,
    public                            boolean                                             not null,
    file_name                         varchar                                             not null,
    content_type                      varchar(256)                                        not null,
    content_length                    bigint                                              not null,
    updated_at                        bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at                        bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    download_cached_url               varchar(5012),
    download_url_expire_in            bigint,
    org_id                            integer default 1                                   not null
        references organizations,
    transcoding_output_key            varchar(128),
    transcoding_output_content_type   varchar(256),
    transcoding_output_content_length bigint,
    waveform_audio_json_str           text
);

alter table  users
    add column avatar_file_id uuid references files on delete set null;

create table organization_members
(
    org_id     integer                                            not null
        references organizations,
    user_id    integer                                            not null
        references users,
    org_role   integer                                            not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    primary key (org_id, user_id)
);

create table tags
(
    name       varchar(512)                                       not null
        primary key,
    org_id     integer                                            not null
        references organizations
            on delete cascade,
    use_case   integer                                            not null,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table classes
(
    id         serial
        primary key,
    name       text                                                not null,
    updated_at bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    org_id     integer default 1                                   not null
        references organizations,
    banner_id  uuid
                                                                   references files
                                                                       on delete set null,
    creator_id integer default 1                                   not null
        references users
            on delete cascade,
    deleted_at bigint
);

create table class_members
(
    class_id   integer                                            not null
        constraint students_class_id_fkey
            references classes
            on delete cascade,
    user_id    integer                                            not null
        constraint students_user_id_fkey
            references users,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    constraint students_pkey
        primary key (class_id, user_id)
);

create table documents
(
    id                     uuid                                                not null
        primary key,
    creator_id             integer                                             not null
        references users,
    org_id                 integer                                             not null
        references organizations,
    parent_id              uuid
        references documents,
    cover_photo_id         uuid
        references files,
    index                  integer                                             not null,
    title                  text                                                not null,
    body                   text                                                not null,
    is_public              boolean default false                               not null,
    hide_rule              integer default 0                                   not null,
    editor_config          jsonb                                               not null,
    deleted_at             bigint,
    updated_by             integer
        references users,
    last_edited_content_at bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    updated_at             bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at             bigint  default (EXTRACT(epoch FROM now()))::bigint not null
);

create table class_documents
(
    class_id    integer                                            not null
        references classes
            on delete cascade,
    document_id uuid                                               not null
        references documents
            on delete cascade,
    updated_at  bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at  bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    primary key (class_id, document_id)
);

create table document_versions
(
    id                     uuid                                               not null
        primary key,
    root_document_id       uuid                                               not null,
    versioning_document_id uuid                                               not null
        references documents
            on delete cascade,
    name                   text                                               not null,
    creator_id             integer
                                                                              references users
                                                                                  on delete set null,
    is_auto                boolean                                            not null,
    updated_at             bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at             bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table document_templates
(
    id           uuid                                                not null
        primary key,
    name         text                                                not null,
    document_id  uuid                                                not null
        references documents
            on delete cascade,
    org_id       integer                                             not null
        references organizations
            on delete set null,
    created_by   integer
                                                                     references users
                                                                         on delete set null,
    is_published boolean default false                               not null,
    updated_at   bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at   bigint  default (EXTRACT(epoch FROM now()))::bigint not null
);

create table document_template_and_tag
(
    document_template_id uuid         not null
        references document_templates
            on delete cascade,
    tag                  varchar(512) not null
        references tags
            on delete cascade,
    primary key (document_template_id, tag)
);

create table document_template_categories
(
    id                 uuid                                               not null
        primary key,
    name               varchar(128)                                       not null,
    org_id             integer                                            not null
        references organizations
            on delete cascade,
    org_internal_index integer,
    is_community       boolean                                            not null,
    community_index    integer,
    updated_at         bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at         bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table document_template_category_tags
(
    category_id uuid         not null
        references document_template_categories
            on delete cascade,
    tag         varchar(512) not null
        references tags
            on delete cascade,
    primary key (category_id, tag)
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

create table band_scores
(
    id         serial
        primary key,
    name       varchar(512)                                       not null,
    range      jsonb                                              not null,
    org_id     integer
        references organizations,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table rubrics
(
    id         uuid                                               not null
        primary key,
    org_id     integer                                            not null
        references organizations
            on delete cascade,
    name       text                                               not null,
    data       jsonb                                              not null,
    updated_at bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at bigint default (EXTRACT(epoch FROM now()))::bigint not null
);

create table assignments
(
    id                                serial
        primary key,
    updated_at                        bigint           default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at                        bigint           default (EXTRACT(epoch FROM now()))::bigint not null,
    document_id                       uuid                                                         not null
        references documents
            on delete cascade,
    graded_type                       integer          default 0                                   not null,
    max_number_of_attempt             integer,
    pre_description                   text             default ''::text,
    test_duration                     integer,
    band_score_id                     integer
        references band_scores,
    grade_method                      integer          default 0                                   not null,
    force_auto_submit                 boolean          default true                                not null,
    allow_submission_change_structure boolean          default true                                not null,
    grade_by_rubric_id                uuid
                                                                                                   references rubrics
                                                                                                       on delete set null,
    weighting_into_final_grade        double precision default 0.0                                 not null
);

create table assignment_submissions
(
    id                            serial
        primary key,
    assignment_id                 integer                                             not null
        references assignments
            on delete cascade,
    user_id                       integer                                             not null
        references users,
    temp_grade                    double precision,
    feedback                      text,
    updated_at                    bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at                    bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    document_id                   uuid                                                not null
        references documents
            on delete cascade,
    attempt_number                integer default 0                                   not null,
    final_grade                   double precision,
    start_at                      bigint  default (EXTRACT(epoch FROM now()))::bigint not null,
    feedback_at                   bigint,
    allow_for_student_view_answer boolean default false                               not null,
    submit_at                     bigint,
    allow_rework                  boolean default false                               not null,
    can_change_structure          boolean default true                                not null
);

create table rubric_submissions
(
    submission_id integer                                            not null
        primary key
        references assignment_submissions
            on delete cascade,
    rubric_id     uuid
                                                                     references rubrics
                                                                         on delete set null,
    graded_data   jsonb                                              not null,
    updated_at    bigint default (EXTRACT(epoch FROM now()))::bigint not null,
    created_at    bigint default (EXTRACT(epoch FROM now()))::bigint not null
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
