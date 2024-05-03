-- This file should undo anything in `up.sql`
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

ALTER TABLE band_scores
    ADD COLUMN org_id INT REFERENCES organizations(id);

ALTER TABLE documents
    ADD COLUMN org_id INT NOT NULL REFERENCES organizations(id);

ALTER TABLE files
    ADD COLUMN org_id INT NOT NULL REFERENCES organizations(id);

ALTER TABLE quiz_structures
    ADD COLUMN org_id INT NOT NULL REFERENCES organizations(id);

ALTER TABLE rubrics
    ADD COLUMN org_id INT NOT NULL REFERENCES organizations(id),
    DROP COLUMN user_id;

ALTER TABLE spaces
    ADD COLUMN org_id INT NOT NULL REFERENCES organizations(id);
