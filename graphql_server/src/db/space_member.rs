use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;
use diesel::sql_types::Integer;

use crate::impl_enum_for_db;
use super::schema::{space_members};
use crate::util::get_now_as_secs;

#[derive(
Debug, Clone, Copy, Eq, PartialEq, FromPrimitive, ToPrimitive, AsExpression, FromSqlRow, Enum,
)]
#[sql_type = "Integer"]
pub enum Role {
    Teacher,
    Student,
}

impl_enum_for_db!(Role);

impl Default for Role {
    fn default() -> Self {
        Self::Teacher
    }
}

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
    pub role: Role,
}

impl SpaceMember {
    pub fn new(
        space_id: i32,
        user_id: i32,
        join_by_token: Option<String>,
        role: Role,
    ) -> Self {
        Self {
            space_id,
            user_id,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
            join_by_token,
            role,
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
        role: Role,
    ) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::space_id.eq(space_id))
            .filter(space_members::role.eq(role))
            .get_results(conn)
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

    pub fn find_all_by_users(conn: &PgConnection, user_ids: &Vec<i32>) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::user_id.eq_any(user_ids))
            .get_results(conn)
    }

    pub fn find_all_by_users_of_space(
        conn: &PgConnection,
        space_id: i32,
        user_ids: &Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        space_members::table
            .filter(space_members::space_id.eq(space_id))
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
