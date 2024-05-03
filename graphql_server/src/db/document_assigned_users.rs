use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::document_assigned_users;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(complex, input_name = "NewDocumentAssignedUserInput")]
#[table_name = "document_assigned_users"]
pub struct DocumentAssignedUser {
    pub document_id: Uuid,
    pub assigned_user_id: i32,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl DocumentAssignedUser {
    pub fn new(document_id: Uuid, assigned_user_id: i32) -> Self {
        Self {
            document_id,
            assigned_user_id,
            created_at: get_now_as_secs(),
        }
    }

    pub fn insert(conn: &PgConnection, mut items: Vec<Self>) -> Result<Vec<Self>, Error> {
        let now = get_now_as_secs();
        items.iter_mut().for_each(|item| item.created_at = now);
        diesel::insert_into(document_assigned_users::table)
            .values(&items)
            .on_conflict_do_nothing()
            .execute(conn)?;
        Ok(items)
    }

    pub fn find_all_by_documents(
        conn: &PgConnection,
        document_ids: Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        document_assigned_users::table
            .filter(document_assigned_users::document_id.eq_any(document_ids))
            .order_by(document_assigned_users::created_at.desc())
            .get_results(conn)
    }

    pub fn remove(conn: &PgConnection, item: Self) -> Result<(), Error> {
        diesel::delete(
            document_assigned_users::table.find((item.document_id, item.assigned_user_id)),
        )
        .execute(conn)?;
        Ok(())
    }
}
