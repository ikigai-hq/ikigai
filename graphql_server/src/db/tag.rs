use diesel::result::Error;
use diesel::{ExpressionMethods, PgConnection, QueryDsl, RunQueryDsl};
use uuid::Uuid;

use super::schema::document_tags;
use crate::util::get_now_as_secs;

#[derive(Debug, Clone, Insertable, Queryable, SimpleObject, InputObject)]
#[graphql(input_name = "DocumentTagInput")]
#[diesel(table_name = document_tags)]
pub struct DocumentTag {
    pub document_id: Uuid,
    pub tag: String,
    #[graphql(skip_input)]
    pub created_at: i64,
}

impl DocumentTag {
    pub fn upsert(conn: &mut PgConnection, mut item: Self) -> Result<Self, Error> {
        item.created_at = get_now_as_secs();
        diesel::insert_into(document_tags::table)
            .values(&item)
            .on_conflict_do_nothing()
            .execute(conn)?;

        Ok(item)
    }

    pub fn find_by_document_ids(
        conn: &mut PgConnection,
        document_ids: &Vec<Uuid>,
    ) -> Result<Vec<Self>, Error> {
        document_tags::table
            .filter(document_tags::document_id.eq_any(document_ids))
            .get_results(conn)
    }

    pub fn delete(conn: &mut PgConnection, document_id: Uuid, tag: String) -> Result<(), Error> {
        diesel::delete(document_tags::table.find((document_id, tag))).execute(conn)?;
        Ok(())
    }
}
