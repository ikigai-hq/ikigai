use diesel::result::Error;
use diesel::sql_types::Integer;
use diesel::{
    BoolExpressionMethods, ExpressionMethods, PgConnection, PgTextExpressionMethods, QueryDsl,
    RunQueryDsl,
};
use std::fmt::{Display, Formatter};

use super::schema::{organization_members, organizations, users};
use crate::impl_enum_for_db;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Hash, Eq, PartialEq, Copy)]
pub enum OrganizationIdentity {
    Id(i32),
}

impl From<i32> for OrganizationIdentity {
    fn from(value: i32) -> Self {
        Self::Id(value)
    }
}

#[derive(
    Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum OrgRole {
    Teacher = 0,
    Student = 1,
}

impl_enum_for_db!(OrgRole);

impl Display for OrgRole {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        let text = match self {
            OrgRole::Teacher => "Teacher",
            OrgRole::Student => "Student",
        };
        write!(f, "{}", text)
    }
}

#[derive(Debug, Clone, Insertable, InputObject)]
#[table_name = "organizations"]
pub struct NewOrganization {
    pub org_name: String,
    pub owner_id: Option<i32>,
}

#[derive(Debug, Clone, AsChangeset, InputObject)]
#[table_name = "organizations"]
#[changeset_options(treat_none_as_null = "true")]
pub struct UpdateOrganizationData {
    pub org_name: String,
    #[graphql(skip)]
    pub updated_at: i64,
}

#[derive(Default, Debug, Clone, Queryable, SimpleObject)]
#[graphql(complex)]
pub struct Organization {
    pub id: i32,
    pub org_name: String,
    pub updated_at: i64,
    pub created_at: i64,
    pub owner_id: Option<i32>,
}

impl Organization {
    pub fn insert(conn: &PgConnection, new_org: NewOrganization) -> Result<Self, Error> {
        diesel::insert_into(organizations::table)
            .values(new_org)
            .get_result(conn)
    }

    pub fn update(
        conn: &PgConnection,
        id: i32,
        mut data: UpdateOrganizationData,
    ) -> Result<Self, Error> {
        data.updated_at = get_now_as_secs();
        diesel::update(organizations::table.find(id))
            .set(data)
            .get_result(conn)
    }

    pub fn find(
        conn: &PgConnection,
        org_id: impl Into<OrganizationIdentity>,
    ) -> Result<Self, Error> {
        let org_identity = org_id.into();
        match org_identity {
            OrganizationIdentity::Id(id) => organizations::table.find(id).first(conn),
        }
    }

    pub fn find_by_owner(conn: &PgConnection, owner_id: i32) -> Result<Self, Error> {
        organizations::table
            .filter(organizations::owner_id.eq(owner_id))
            .first(conn)
    }

    pub fn find_all_by_ids(conn: &PgConnection, ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        organizations::table
            .filter(organizations::id.eq_any(ids))
            .get_results(conn)
    }
}

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(complex, input_name = "OrganizationMemberInput")]
#[table_name = "organization_members"]
pub struct OrganizationMember {
    pub org_id: i32,
    pub user_id: i32,
    pub org_role: OrgRole,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl OrganizationMember {
    pub fn new(org_id: i32, user_id: i32, org_role: OrgRole) -> Self {
        Self {
            org_role,
            org_id,
            user_id,
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, member: OrganizationMember) -> Result<Self, Error> {
        diesel::insert_into(organization_members::table)
            .values(&member)
            .on_conflict((organization_members::org_id, organization_members::user_id))
            .do_update()
            .set((organization_members::org_role.eq(member.org_role),))
            .get_result(conn)
    }

    pub fn find(
        conn: &PgConnection,
        org_id: impl Into<OrganizationIdentity>,
        user_id: i32,
    ) -> Result<Self, Error> {
        let OrganizationIdentity::Id(org_id) = org_id.into();
        organization_members::table
            .find((org_id, user_id))
            .first(conn)
    }

    pub fn find_by_user(conn: &PgConnection, user_id: i32) -> Result<Self, Error> {
        organization_members::table
            .filter(organization_members::user_id.eq(user_id))
            .first(conn)
    }

    pub fn find_all_by_user(conn: &PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        organization_members::table
            .filter(organization_members::user_id.eq(user_id))
            .order_by(organization_members::created_at.asc())
            .get_results(conn)
    }

    pub fn find_all_by_users(conn: &PgConnection, user_ids: &Vec<i32>) -> Result<Vec<Self>, Error> {
        organization_members::table
            .filter(organization_members::user_id.eq_any(user_ids))
            .get_results(conn)
    }

    pub fn find_all_org_users(
        conn: &PgConnection,
        org_id: OrganizationIdentity,
        user_ids: &Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        let org = Organization::find(conn, org_id)?;
        organization_members::table
            .filter(organization_members::org_id.eq(org.id))
            .filter(organization_members::user_id.eq_any(user_ids))
            .get_results(conn)
    }

    pub fn find_all_by_org(conn: &PgConnection, org_id: i32) -> Result<Vec<Self>, Error> {
        organization_members::table
            .filter(organization_members::org_id.eq(org_id))
            .get_results(conn)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn filter_all(
        conn: &PgConnection,
        org_id: i32,
        keyword: Option<String>,
        role: Option<OrgRole>,
        created_at_from: Option<i64>,
        created_at_to: Option<i64>,
        offset: i64,
        limit: i64,
    ) -> Result<(Vec<Self>, i64), Error> {
        let get_query = move || {
            let mut query = organization_members::table
                .inner_join(users::table)
                .select(organization_members::all_columns)
                .filter(organization_members::org_id.eq(org_id))
                .into_boxed();

            if let Some(keyword) = keyword.as_ref() {
                query = query.filter(
                    users::first_name
                        .ilike(format!("%{keyword}%"))
                        .or(users::last_name.ilike(format!("%{keyword}%")))
                        .or(users::email.ilike(format!("%{keyword}%"))),
                );
            }

            if let Some(role) = role {
                query = query.filter(organization_members::org_role.eq(role));
            }

            if let Some(created_at_from) = created_at_from {
                query = query.filter(organization_members::created_at.ge(created_at_from));
            }

            if let Some(created_at_to) = created_at_to {
                query = query.filter(organization_members::created_at.le(created_at_to));
            }

            query
        };

        let items = get_query()
            .order_by(organization_members::created_at.asc())
            .offset(offset)
            .limit(limit)
            .get_results(conn)?;
        let total = get_query().count().get_result(conn)?;

        Ok((items, total))
    }

    pub fn count_by_role(
        conn: &PgConnection,
        org_id: i32,
        org_role: OrgRole,
    ) -> Result<i64, Error> {
        organization_members::table
            .filter(organization_members::org_id.eq(org_id))
            .filter(organization_members::org_role.eq(org_role))
            .count()
            .get_result(conn)
    }

    pub fn remove(conn: &PgConnection, org_id: i32, user_id: i32) -> Result<(), Error> {
        diesel::delete(organization_members::table.find((org_id, user_id))).execute(conn)?;
        Ok(())
    }
}

#[derive(Debug, Clone, SimpleObject)]
pub struct PublicOrganizationInformation {
    pub id: i32,
    pub org_name: String,
    pub owner_id: Option<i32>,
}

impl From<Organization> for PublicOrganizationInformation {
    fn from(org: Organization) -> Self {
        Self {
            id: org.id,
            org_name: org.org_name,
            owner_id: org.owner_id,
        }
    }
}
