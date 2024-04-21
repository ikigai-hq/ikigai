-- This file should undo anything in `up.sql`
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
