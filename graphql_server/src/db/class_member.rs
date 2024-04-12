use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use oso::PolarClass;

use super::schema::class_members;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, PolarClass, InputObject)]
#[table_name = "class_members"]
#[graphql(complex, input_name = "AddClassMemberInput")]
pub struct Member {
    pub class_id: i32,
    #[polar(attribute)]
    pub user_id: i32,
    #[graphql(skip_input)]
    pub updated_at: i64,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl Member {
    pub fn new(class_id: i32, user_id: i32) -> Self {
        Self {
            class_id,
            user_id,
            updated_at: get_now_as_secs(),
            created_at: get_now_as_secs(),
        }
    }

    pub fn upsert(conn: &PgConnection, member: Member) -> Result<Self, Error> {
        diesel::insert_into(class_members::table)
            .values(&member)
            .on_conflict((class_members::class_id, class_members::user_id))
            .do_update()
            .set(class_members::updated_at.eq(get_now_as_secs()))
            .get_result(conn)
    }

    pub fn find_opt(
        conn: &PgConnection,
        class_id: i32,
        user_id: i32,
    ) -> Result<Option<Self>, Error> {
        match Self::find(conn, class_id, user_id) {
            Ok(class_member) => Ok(Some(class_member)),
            Err(Error::NotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn find(conn: &PgConnection, class_id: i32, user_id: i32) -> Result<Self, Error> {
        class_members::table.find((class_id, user_id)).first(conn)
    }

    pub fn find_all_by_classes(
        conn: &PgConnection,
        class_ids: Vec<i32>,
    ) -> Result<Vec<Self>, Error> {
        class_members::table
            .filter(class_members::class_id.eq_any(class_ids))
            .order_by(class_members::created_at.desc())
            .get_results(conn)
    }

    pub fn find_all_by_users(conn: &PgConnection, user_ids: Vec<i32>) -> Result<Vec<Self>, Error> {
        class_members::table
            .filter(class_members::user_id.eq_any(user_ids))
            .get_results(conn)
    }

    pub fn remove_by_user(conn: &PgConnection, user_id: i32) -> Result<(), Error> {
        diesel::delete(class_members::table.filter(class_members::user_id.eq(user_id)))
            .execute(conn)?;
        Ok(())
    }

    pub fn remove(conn: &PgConnection, class_id: i32, user_id: i32) -> Result<(), Error> {
        diesel::delete(class_members::table.find((class_id, user_id))).execute(conn)?;
        Ok(())
    }
}
