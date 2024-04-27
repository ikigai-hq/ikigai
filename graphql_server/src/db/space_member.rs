use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;

use super::schema::{organization_members, space_members};
use crate::db::{OrgRole, OrganizationMember};
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, PolarClass, InputObject)]
#[table_name = "space_members"]
#[graphql(complex, input_name = "AddSpaceMemberInput")]
pub struct SpaceMember {
    pub space_id: i32,
    #[polar(attribute)]
    pub user_id: i32,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
    #[graphql(skip_input)]
    pub join_by_token: Option<String>,
}

impl SpaceMember {
    pub fn new(space_id: i32, user_id: i32, join_by_token: Option<String>) -> Self {
        Self {
            space_id,
            user_id,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            join_by_token,
        }
    }

    pub fn upsert(conn: &PgConnection, member: SpaceMember) -> Result<Self, Error> {
        diesel::insert_into(space_members::table)
            .values(&member)
            .on_conflict((space_members::space_id, space_members::user_id))
            .do_update()
            .set(space_members::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn find_opt(
        conn: &PgConnection,
        space_id: i32,
        user_id: i32,
    ) -> Result<Option<Self>, Error> {
        match Self::find(conn, space_id, user_id) {
            Ok(space_member) => Ok(Some(space_member)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find(conn: &PgConnection, space_id: i32, user_id: i32) -> Result<Self, Error> {
        space_members::table.find((space_id, user_id)).first(conn)
    }

    pub fn find_all_space_members_by_role_and_class(
        conn: &PgConnection,
        space_id: i32,
        org_id: i32,
        role: OrgRole,
    ) -> Result<Vec<Self>, Error> {
        let members: Vec<Self> = space_members::table
            .filter(space_members::space_id.eq(space_id))
            .get_results(conn)?;
        let user_ids: Vec<i32> = members.iter().map(|member| member.user_id).collect();

        let org_members: Vec<OrganizationMember> = organization_members::table
            .filter(organization_members::org_id.eq(org_id))
            .filter(organization_members::user_id.eq_any(user_ids))
            .filter(organization_members::org_role.eq(role))
            .get_results(conn)?;
        let org_member_ids: Vec<i32> = org_members.iter().map(|m| m.user_id).collect();

        Ok(members
            .into_iter()
            .filter(|member| org_member_ids.contains(&member.user_id))
            .collect())
    }

    pub fn find_all_by_classes(
        conn: &PgConnection,
        space_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::space_id.eq_any(space_ids))
            .order_by(space_members::created_at.desc())
            .get_results(conn)
    }

    pub fn find_all_by_user(conn: &PgConnection, user_id: i32) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::user_id.eq(user_id))
            .get_results(conn)
    }

    pub fn find_all_by_users(conn: &PgConnection, user_ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::user_id.eq_any(user_ids))
            .get_results(conn)
    }

    pub fn remove_by_user(conn: &PgConnection, user_id: i32) -> Result<(), Error> {
        diesel::delete(space_members::table.filter(space_members::user_id.eq(user_id)))
            .execute(conn)?;
        Ok(())
    }

    pub fn remove(conn: &PgConnection, space_id: i32, user_id: i32) -> Result<(), Error> {
        diesel::delete(space_members::table.find((space_id, user_id))).execute(conn)?;
        Ok(())
    }
}
